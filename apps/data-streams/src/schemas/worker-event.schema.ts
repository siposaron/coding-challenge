import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Document } from 'mongoose';
import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';
import { WorkerIntent } from '../commons/worker-intent.enum';
import { BaseDocument } from './base/base-document';
import { valueToISODateString } from './transformers/schema.transformer';

@Schema({ timestamps: true, collection: 'worker-events' })
export class WorkerEvent extends BaseDocument {
  constructor(partial: Partial<WorkerEvent> = {}) {
    super();
    Object.assign(this, partial);
  }

  @ApiProperty({
    type: ObjectType,
    enum: [ObjectType.Contact, ObjectType.Company],
    example: ObjectType.Contact,
  })
  @Prop({
    type: ObjectType,
    enum: [ObjectType.Contact, ObjectType.Company],
    default: ObjectType.Contact,
  })
  objectType: ObjectType;

  @ApiProperty({
    type: DataSource,
    enum: [DataSource.HubSpot],
    example: DataSource.HubSpot,
  })
  @Prop({
    type: DataSource,
    enum: [DataSource.HubSpot],
    default: DataSource.HubSpot,
  })
  dataSource: DataSource;

  @ApiProperty({
    type: WorkerIntent,
    enum: [WorkerIntent.Start, WorkerIntent.Stop],
    example: WorkerIntent.Start,
  })
  @Prop({
    type: WorkerIntent,
    enum: [WorkerIntent.Start, WorkerIntent.Stop],
  })
  workerIntent: WorkerIntent;

  // ------- AUDIT
  @ApiProperty({
    type: Date,
    description: 'Worker event creation date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Worker event update date in own system.',
  })
  @Transform(valueToISODateString)
  @Prop()
  updatedAt: Date;
}

const WorkerEventSchema = SchemaFactory.createForClass(WorkerEvent);

export type WorkerEventDocument = WorkerEvent & Document;

export const WorkerEventFeature = {
  name: WorkerEvent.name,
  useFactory: () => {
    return WorkerEventSchema;
  },
};
