import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChangeWorkerStateEvent, WorkerEvents } from '../events/worker.events';
import { WorkerEventService } from '../services/worker-event.service';

@Injectable()
export class WorkerEventListener {
  private readonly logger = new Logger(WorkerEventListener.name);

  constructor(private readonly workerEventService: WorkerEventService) {}

  @OnEvent(WorkerEvents.ChangeWorkerState, { async: true })
  async handleChangeWorkerEventListener(event: ChangeWorkerStateEvent) {
    try {
      this.logger.debug(
        `WorkerEvents.ChangeWorkerState. ${JSON.stringify(event)}`,
      );
      await this.workerEventService.saveWorkerEvent(event.workerEvent);
      this.logger.debug(`Worker change state event saved.`);
    } catch (e) {
      this.logger.error(
        `Worker change state event could not be saved. ${JSON.stringify(
          event.workerEvent,
        )}`,
      );
    }
  }
}
