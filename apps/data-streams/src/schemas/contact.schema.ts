import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Document, SchemaTypes } from 'mongoose';
import { DataSource } from '../commons/datasource.enum';
import {
  valueToISODateString,
  valueToString,
} from './transformers/schema.transformer';

@Schema({ timestamps: true })
export class Contact {
  constructor(partial: Partial<Contact> = {}) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: String, name: 'id', description: 'The document id.' })
  @Expose({ name: 'id' })
  @Transform(valueToString)
  @Prop({ type: SchemaTypes.ObjectId })
  _id: string;

  @ApiProperty({
    type: Number,
    name: 'version',
    description: 'The document version',
  })
  @Expose({ name: 'version' })
  @Prop()
  __v: number;

  @ApiProperty({
    type: String,
    description: 'The contact id in the external system.',
  })
  @Prop()
  foreignId: string;

  @ApiProperty({
    type: DataSource,
    enum: [DataSource.HubSpot],
    description: 'The external 3rd party system data is originating from.',
  })
  @Prop({
    type: DataSource,
    enum: [DataSource.HubSpot],
    default: DataSource.HubSpot,
  })
  dataSource: DataSource;

  @ApiProperty({ type: String, description: 'Contact first name.' })
  @Prop()
  firstName: string;

  @ApiProperty({ type: String, description: 'Contact last name.' })
  @Prop()
  lastName: string;

  @ApiProperty({ type: String, description: 'Contact email address.' })
  @Prop()
  email: string;

  @ApiProperty({
    type: Date,
    description: 'Contact creation date in the external system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  foreignCreateDate: Date;

  @ApiProperty({
    type: Date,
    description: 'Contact modify date in the external system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  foreignModifyDate: Date;

  // ------- AUDIT
  @ApiProperty({
    type: Date,
    description: 'Contact creation date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Contact modify date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  updatedAt: Date;
}

const ContactSchema = SchemaFactory.createForClass(Contact);

export type ContactDocument = Contact & Document;

export const ContactFeature = {
  name: Contact.name,
  useFactory: () => {
    return ContactSchema;
  },
};