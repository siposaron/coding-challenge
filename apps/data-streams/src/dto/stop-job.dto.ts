import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StopJobDto {
  constructor(stopJobDto: Partial<StopJobDto> = {}) {
    Object.assign(this, stopJobDto);
  }

  @ApiProperty({
    type: ObjectType,
    enum: [ObjectType.Contact, ObjectType.Company],
    example: ObjectType.Contact,
  })
  @IsEnum(ObjectType)
  objectType: ObjectType;

  @ApiProperty({
    type: DataSource,
    enum: [DataSource.HubSpot],
    example: DataSource.HubSpot,
  })
  @IsEnum(DataSource)
  dataSource: DataSource;
}
