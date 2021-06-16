import { ObjectType } from './object-type.enum';

export class ImportResult {
  date: Date;
  objectType: ObjectType;
  successfulImports: number;
  failedImports: number;
  failedForeignIds: string[];
}
