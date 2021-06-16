import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StartJobDto {
  constructor(startJobDto: Partial<StartJobDto> = {}) {
    Object.assign(this, startJobDto);
  }

  @ApiPropertyOptional({ type: Date, example: '2021-07-07T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @Transform((obj) => (obj?.value ? new Date(Date.parse(obj?.value)) : null))
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
