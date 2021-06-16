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

  private fromId: string;

  /**
   * Starts the contact reader job.
   *
   * @param fromId the `hs_object_id` of contacts fetching is starting from
   * @param name optional job name, defaults to `CONTACTS_CRON_JOB`
   * @param minutes optional scheduler minutes, defaults to `5`
   */
  async startContactReaderJob(
    fromId?: string,
    name = this.contactsCronJob,
    minutes = 5, // TODO: change to 5, could set from env var
  ): Promise<WorkerStatus> {
    try {
      this.fromId = fromId ? fromId : null;

      if (!this.schedulerRegistry.doesExists('cron', name)) {
        const job = this.createCronJob(minutes, name);
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
        this.logger.debug(`Job ${name} is started!`);
      } else {
        this.updateCronJob(name, minutes);
      }
      return WorkerStatus.Started;
    } catch (e) {
      this.logger.error(`Job could not be started. ${e.message}`);
      throw new RpcException('Job could not be started.');
    }
  }

  private createCronJob(minutes: number, name: string) {
    return new CronJob(`0 */${minutes} * * * *`, async () => {
      this.logger.warn(`Job ${name} runs each (${minutes}) minutes`);
      // fetch contacts from hubspot
      const contacts = await this.getContactsFromHubspot(this.fromId);
      this.logger.debug(
        `Number of contacts to send to data streams ${contacts.length}`,
      );

      // set the fromId from last contact in list
      if (contacts && contacts.length > 0) {
        const lastContact = contacts[contacts.length - 1];
        this.fromId = lastContact.id;

        // send to data-streams service
        const status = await this.client
          .send<ProcessingStatus, ContactDto[]>(
            { cmd: 'import.contacts' },
            contacts,
          )
          .toPromise();
        this.logger.debug(`Status of sending contacts ${status}`);
      }
    });
  }

  private updateCronJob(name: string, minutes: number) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.setTime(new CronTime(`0 */${minutes} * * * *`));
    this.logger.debug(`Job ${name} is updated to ${minutes} minutes!`);
    if (!job.running) {
      job.start();
      this.logger.debug(`Job ${name} is started`);
    }
  }

  /**
   * Stops the contact reader job
   * @param name the name of the job, defaults to `CONTACTS_CRON_JOB`
   */
  async stopContactReaderJob(
    name = this.contactsCronJob,
  ): Promise<WorkerStatus> {
    this.logger.debug(`Stopping job ${name}.`);
    if (this.schedulerRegistry.doesExists('cron', name)) {
      const job = this.schedulerRegistry.getCronJob(name);
      job.stop();
      this.logger.debug(`Job ${name} is stopped.`);
    }
    return WorkerStatus.Stopped;
  }

  /**
   * Retrieves the contacts from a hubspot account in batches of 100.
   *
   * @param fromDate filtering start date
   * @returns list of {@link Contact}
   */
  private async getContactsFromHubspot(id?: string): Promise<ContactDto[]> {
    this.logger.debug(`Fetching contacts from HubSpot started. From id: ${id}`);

    const hubspotContacts: HubspotContact[] =
      await this.hubspotService.getContacts(id);

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
