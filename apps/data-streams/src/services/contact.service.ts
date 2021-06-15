import { Injectable, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProcessingStatus } from '../commons/processing-status.enum';
import { ContactCountDto } from '../dto/contact-count.dto';
import { ContactDto } from '../dto/contact.dto';
import { Contact, ContactDocument } from '../schemas/contact.schema';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
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

    return contactDocuments.map((doc) => new Contact(doc));
  }

  /**
   * Save contacts from Hubspot into own DB
   * @param contactDtos the received contacts
   * @returns ProcessingStatus
   */
  @MessagePattern({ cmd: 'processContacts' })
  async processContacts(contactDtos: ContactDto[]): Promise<ProcessingStatus> {
    try {
      const bulkOperation =
        this.contactModel.collection.initializeUnorderedBulkOp();
      contactDtos.forEach((contactDto) =>
        bulkOperation
          .find({ foreignId: contactDto.id })
          .upsert()
          .updateOne({
            foreignId: contactDto.id,
            firstName: contactDto.firstName,
            lastName: contactDto.lastName,
            email: contactDto.email,
            foreignCreateDate: new Date(contactDto.createDate),
            foreignModifyDate: new Date(contactDto.modifyDate),
          } as Contact),
      );
      const result = await bulkOperation.execute();
      this.logger.debug(`Contact import results: ${JSON.stringify(result)}`);
      return ProcessingStatus.Ok;
    } catch (e) {
      this.logger.error(`Contact import failed ${e.message}`);
      return ProcessingStatus.NOk;
    }
  }
}
