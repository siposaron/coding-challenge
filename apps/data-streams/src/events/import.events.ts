import { ImportMetrics } from '../schemas/import-metrics.schema';

export enum ImportEvents {
  ContactImportFinished = 'contact.import.finished',
}

export class ContactImportFinishedEvent {
  importMetrics: ImportMetrics;
}
