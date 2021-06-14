import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum } from 'class-validator';
import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StartJobDto {
  constructor(startJobDto: Partial<StartJobDto> = {}) {
    Object.assign(this, startJobDto);
  }

  @ApiPropertyOptional({ type: Date, example: '2021-07-07T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  fromDate: Date;

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
