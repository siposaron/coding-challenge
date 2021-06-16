import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StartJobDto {
  constructor(startJobDto: Partial<StartJobDto> = {}) {
    Object.assign(this, startJobDto);
  }
  fromId: string;
  objectType: ObjectType;
  dataSource: DataSource;
}
