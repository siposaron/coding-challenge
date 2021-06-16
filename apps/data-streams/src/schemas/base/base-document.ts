import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { SchemaTypes } from 'mongoose';
import { valueToString } from '../transformers/schema.transformer';

export class BaseDocument {
  @ApiProperty({ type: String, name: 'id', description: 'The document id.' })
  @Expose({ name: 'id' })
  @Transform(valueToString)
  @IsOptional()
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
}
