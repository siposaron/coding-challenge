import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ImportMetrics,
  ImportMetricsDocument,
} from '../schemas/import-metrics.schema';

@Injectable()
export class ImportMetricsService {
  private readonly logger = new Logger(ImportMetricsService.name);

  constructor(
    @InjectModel(ImportMetrics.name)
    private readonly importMetricsModel: Model<ImportMetricsDocument>,
  ) {}

  /**
   * Save the import metrics, i.e. data from HubSpot.
   *
   * @param importMetrics the import metrics
   * @returns
   */
  async saveImportMetrics(
    importMetrics: ImportMetrics,
  ): Promise<ImportMetrics> {
    try {
      const importMetricsModel = new this.importMetricsModel(importMetrics);
      const importMetricsDoc = await importMetricsModel.save();
      if (!importMetricsDoc) {
        throw new Error(`Couldn't save the import metrics`);
      }
      return new ImportMetrics(importMetricsDoc.toJSON());
    } catch (e) {
      this.logger.error(
        `Import metrics could not be saved for ${JSON.stringify(e.message)}`,
      );
    }
  }
}
