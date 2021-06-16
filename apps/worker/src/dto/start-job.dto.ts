import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StartJobDto {
  constructor(startJobDto: Partial<StartJobDto> = {}) {
    Object.assign(this, startJobDto);
  }
  // TODO: validate for UTC date string
  fromDate: string;
  objectType: ObjectType;
  dataSource: DataSource;
}
