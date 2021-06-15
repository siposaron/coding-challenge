import { Inject, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { HubspotService } from './hubspot/hubspot.service';
import { ContactDto } from '../dto/contact.dto';
import { HubspotContact } from '../dto/hubspot/hubspot.contact.dto';
import { WorkerStatus } from '../commons/worker-status.enum';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ProcessingStatus } from '../commons/processing-status.enum';

/**
 * Scheduler responsible for starting and stopping jobs that fetch contacts from Hubspot.
 */
@Injectable()
export class ContactSchedulerService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly hubspotService: HubspotService,
    @Inject('DATA_STREAMS_SERVICE') private readonly client: ClientProxy,
  ) {}

  private readonly logger = new Logger(ContactSchedulerService.name);
  private readonly contactsCronJob = 'CONTACTS_CRON_JOB';

  private fromDate: Date;

  /**
   * Starts the contact reader job.
   *
   * @param fromDate the `lastmodifieddate` of contacts fetching is starting from
   * @param name optional job name, defaults to `CONTACTS_CRON_JOB`
   * @param minutes optional scheduler minutes, defaults to `5`
   */
  async startContactReaderJob(
    fromDate?: Date,
    name = this.contactsCronJob,
    minutes = 1,
  ): Promise<WorkerStatus> {
    try {
      if (fromDate) {
        this.fromDate = fromDate;
      }

      if (!this.schedulerRegistry.doesExists('cron', name)) {
        const job = new CronJob(`* */${minutes} * * * *`, async () => {
          this.logger.warn(`Job ${name} runs each (${minutes}) minutes`);
          // fetch contacts from hubspot
          const contacts = await this.getContactsFromHubspot(this.fromDate);
          // set the fromDate from last contact in list
          if (contacts && contacts.length > 0) {
            const lastContact = contacts[contacts.length - 1];
            this.fromDate = new Date(lastContact.modifyDate);
          }
          // send to data-streams service
          // TODO: extract to different service with retry mechanism
          const status = await this.client
            .send<ProcessingStatus, ContactDto[]>(
              { cmd: 'processContacts' },
              contacts,
            )
            .toPromise();
          this.logger.debug(`Status of sending contacts ${status}`);
        });
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        this.logger.debug(`Job ${name} is started!`);
      } else {
        const job = this.schedulerRegistry.getCronJob(name);
        job.setTime(new CronTime(`* */${minutes} * * * *`));
        this.logger.debug(`Job ${name} is updated to ${minutes} minutes!`);
      }
      return WorkerStatus.Started;
    } catch (e) {
      this.logger.error(`Job could not be started. ${e.message}`);
      throw new RpcException('Job could not be started.');
    }
  }

  /**
   * Stops the contact reader job
   * @param name the name of the job, defaults to `CONTACTS_CRON_JOB`
   */
  stopContactReaderJob(name = this.contactsCronJob) {
    const job = this.schedulerRegistry.getCronJob(name);
    if (job) {
      job.stop();
      this.logger.debug(`Job ${name} is stopped.`);
    }
  }

  /**
   * Retrieves the contacts from a hubspot account in batches of 100.
   *
   * @param fromDate filtering start date
   * @returns list of {@link Contact}
   */
  private async getContactsFromHubspot(fromDate: Date): Promise<ContactDto[]> {
    this.logger.debug(
      `Fetching contacts from HubSpot started. From createdate: ${fromDate}`,
    );

    const hubspotContacts: HubspotContact[] =
      await this.hubspotService.getContacts(fromDate);

    this.logger.debug(
      `Fetched ${hubspotContacts.length} contacts from HubSpot.`,
    );

    if (hubspotContacts) {
      return hubspotContacts.map((hubspotContact) => {
        return {
          id: hubspotContact.properties.hs_object_id,
          firstName: hubspotContact.properties.firstname,
          lastName: hubspotContact.properties.lastname,
          email: hubspotContact.properties.email,
          createDate: hubspotContact.properties.createdate,
          modifyDate: hubspotContact.properties.lastmodifieddate,
        } as ContactDto;
      });
    } else {
      return null;
    }
  }
}
