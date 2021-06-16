import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ContactImportFinishedEvent,
  ImportEvents,
} from '../events/import.events';
import { ImportMetricsService } from '../services/import-metrics.service';

@Injectable()
export class ImportEventListener {
  private readonly logger = new Logger(ImportEventListener.name);

  constructor(private readonly importMetricsService: ImportMetricsService) {}

  @OnEvent(ImportEvents.ContactImportFinished, { async: true })
  async handleImportEventListener(event: ContactImportFinishedEvent) {
    try {
      this.logger.debug(
        `ImportEvents.ContactImportFinished. ${JSON.stringify(event)}`,
      );
      await this.importMetricsService.saveImportMetrics(event.importMetrics);
      this.logger.debug(`Import metrics saved.`);
    } catch (e) {
      this.logger.error(
        `Import metrics could not be saved. ${JSON.stringify(
          event.importMetrics,
        )}`,
      );
    }
  }
}
