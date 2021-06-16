import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  WorkerEvent,
  WorkerEventDocument,
} from '../schemas/worker-event.schema';

@Injectable()
export class WorkerEventService {
  private readonly logger = new Logger(WorkerEventService.name);

  constructor(
    @InjectModel(WorkerEvent.name)
    private readonly workerEventModel: Model<WorkerEventDocument>,
  ) {}

  /**
   * Save the worker event, i.e. starting / stopping worker job.
   *
   * @param workerEvent the incoming event
   * @returns
   */
  async saveWorkerEvent(workerEvent: WorkerEvent): Promise<WorkerEvent> {
    try {
      const workerEventModel = new this.workerEventModel(workerEvent);
      const workerEventDoc = await workerEventModel.save();
      if (!workerEventDoc) {
        throw new Error(`Couldn't save the worker event`);
      }
      return new WorkerEvent(workerEventDoc.toJSON());
    } catch (e) {
      this.logger.error(
        `Worker event could not be saved for ${JSON.stringify(e.message)}`,
      );
    }
  }
}
