import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob, CronTime } from 'cron';
import { HubspotService } from './hubspot/hubspot.service';
import { Contact } from '../dto/contact.dto';
import { HubspotContact } from '../dto/hubspot/hubspot.contact.dto';

/**
 * Scheduler responsible for starting and stopping jobs that fetch contacts from Hubspot.
 */
@Injectable()
export class ContactSchedulerService {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly hubspotService: HubspotService,
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
  startContactReaderJob(
    fromDate?: Date,
    name = this.contactsCronJob,
    minutes = 5,
  ) {
    if (fromDate) {
      this.fromDate = fromDate;
    }
    let job = this.schedulerRegistry.getCronJob(name);
    if (!job) {
      job = new CronJob(`* /${minutes} * * * *`, async () => {
        this.logger.warn(`Job ${name} runs each (${minutes}) minutes`);
        // fetch contacts from hubspot
        const contacts = await this.getContactsFromHubspot(this.fromDate);
        // set the fromDate from last contact in list
        if (contacts && contacts.length > 0) {
          const lastContact = contacts[contacts.length - 1];
          this.fromDate = new Date(lastContact.modifyDate);
        }
      });
      this.schedulerRegistry.addCronJob(name, job);
      job.start();
      this.logger.debug(`Job ${name} is started!`);
    } else {
      job.setTime(new CronTime(`* /${minutes} * * * *`));
      this.logger.debug(`Job ${name} is updated to ${minutes} minutes!`);
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
  private async getContactsFromHubspot(fromDate: Date): Promise<Contact[]> {
    Logger.debug(
      `Fetching contacts from HubSpot started. From createdate: ${fromDate}`,
    );

    const hubspotContacts: HubspotContact[] = await this.hubspotService
      .getContacts(fromDate)
      .toPromise();

    Logger.debug(`Fetched ${hubspotContacts.length} contacts from HubSpot.`);

    return hubspotContacts.map((hubspotContact) => {
      return {
        id: hubspotContact.properties.hs_object_id,
        firstName: hubspotContact.properties.firstname,
        lastName: hubspotContact.properties.lastname,
        email: hubspotContact.properties.email,
        createDate: hubspotContact.properties.createdate,
        modifyDate: hubspotContact.properties.lastmodifieddate,
      } as Contact;
    });
  }

  //TODO: push data to data-streams
}
