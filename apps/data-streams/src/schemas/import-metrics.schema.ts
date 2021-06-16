import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';
import { ObjectType } from '../commons/object-type.enum';
import { BaseDocument } from './base/base-document';
import { valueToISODateString } from './transformers/schema.transformer';

@Schema({ timestamps: true, collection: 'import-metrics' })
export class ImportMetrics extends BaseDocument {
  constructor(partial: Partial<ImportMetrics> = {}) {
    super();
    Object.assign(this, partial);
  }

  @ApiProperty({
    type: String,
    description: 'The object id in the external system.',
  })
  @Prop()
  foreignId: string;

  @ApiProperty({
    type: ObjectType,
    enum: [ObjectType.Contact, ObjectType.Company],
    description: 'The object type imported.',
  })
  @Prop({
    type: ObjectType,
    enum: [ObjectType.Contact, ObjectType.Company],
    default: ObjectType.Contact,
  })
  objectType: ObjectType;

  @ApiProperty({
    type: Number,
    description: 'The number of successfully imported objects',
  })
  @Prop()
  successfulImports: number;

  @ApiProperty({
    type: Number,
    description: 'The number of failed objects during import',
  })
  @Prop()
  failedImports: number;

  @ApiProperty({
    type: String,
    isArray: true,
    description: 'The foreign ids of the failed objects during import',
  })
  @Prop()
  failedForeignIds: string[];

  // ------- AUDIT
  @ApiProperty({
    type: Date,
    description: 'Metrics creation date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Metrics update date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  updatedAt: Date;
}

const ImportMetricsSchema = SchemaFactory.createForClass(ImportMetrics);

export type ImportMetricsDocument = ImportMetrics & Document;

export const ImportMetricsFeature = {
  name: ImportMetrics.name,
  useFactory: () => {
    return ImportMetricsSchema;
  },
};
