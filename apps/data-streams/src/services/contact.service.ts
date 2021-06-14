import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactCountDto } from '../dto/contact-count.dto';
import { Contact, ContactDocument } from '../schemas/contact.schema';

@Injectable()
export class ContactService {
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
}
