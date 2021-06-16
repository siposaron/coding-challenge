import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional } from 'class-validator';
import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StartJobDto {
  constructor(startJobDto: Partial<StartJobDto> = {}) {
    Object.assign(this, startJobDto);
  }

  @ApiPropertyOptional({ type: String, example: '1212' })
  @IsOptional()
  @IsNumberString()
  fromId: string;

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
