import { DataSource } from '../commons/datasource.enum';
import { ObjectType } from '../commons/object-type.enum';

export class StopJobDto {
  constructor(stopJobDto: Partial<StopJobDto> = {}) {
    Object.assign(this, stopJobDto);
  }

  objectType: ObjectType;
  dataSource: DataSource;
}
