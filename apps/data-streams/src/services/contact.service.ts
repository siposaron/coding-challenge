import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProcessingStatus } from '../commons/processing-status.enum';
import { ContactCountDto } from '../dto/contact-count.dto';
import { ContactDto } from '../dto/contact.dto';
import {
  ContactImportFinishedEvent,
  ImportEvents,
} from '../events/import.events';
import { Contact, ContactDocument } from '../schemas/contact.schema';
import { ImportMetrics } from '../schemas/import-metrics.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  private readonly upsertOptions = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  };

  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Counts the created / imported contacts
   * @returns the number of contacts
   */
  async countContacts(): Promise<ContactCountDto> {
    const count = await this.contactModel.countDocuments({}).exec();
    return { count } as ContactCountDto;
  }

  /**
   * Lists the contacts in the system.
   * @param offset the offset to start from
   * @param limit the max number of contacts to return
   * @returns the limited list of contacts
   */
  async listContacts(offset = 0, limit = 10): Promise<Contact[]> {
    const contactDocuments: ContactDocument[] = await this.contactModel
      .find()
      .limit(limit)
      .skip(offset * limit)
      .exec();

    return contactDocuments.map((doc) => new Contact(doc.toJSON()));
  }

  /**
   * Save contacts from Hubspot into own DB
   * @param contactDtos the received contacts
   * @returns ProcessingStatus
   */
  async importContacts(contactDtos: ContactDto[]): Promise<ProcessingStatus> {
    this.logger.debug(
      `Importing ${JSON.stringify(contactDtos.length)} contacts.`,
    );

    const importMetrics = {
      successfulImports: 0,
      failedImports: 0,
      failedForeignIds: [],
      createdAt: new Date(),
    } as ImportMetrics;

    if (contactDtos && contactDtos.length > 0) {
      for (const contactDto of contactDtos) {
        try {
          await this.contactModel
            .findOneAndUpdate(
              { foreignId: contactDto.id },
              {
                foreignId: contactDto.id,
                firstName: contactDto.firstName,
                lastName: contactDto.lastName,
                email: contactDto.email,
                foreignCreateDate: new Date(contactDto.createDate),
                foreignModifyDate: new Date(contactDto.modifyDate),
              } as Contact,
              this.upsertOptions,
            )
            .exec();

          importMetrics.successfulImports++;
        } catch (e) {
          importMetrics.failedImports++;
          importMetrics.failedForeignIds.push(contactDto.id);
        }
      }
    }

    // raise event to save importMetrics
    this.eventEmitter.emitAsync(ImportEvents.ContactImportFinished, {
      importMetrics,
    } as ContactImportFinishedEvent);

    return importMetrics.failedImports > 0
      ? ProcessingStatus.NOk
      : ProcessingStatus.Ok;
  }
}
