import { Injectable, Logger } from '@nestjs/common';
import { WorkerStatus } from '../commons/worker-status.enum';
import { ContactSchedulerService } from './contact.scheduler.service';

@Injectable()
export class WorkerService {
  constructor(
    private readonly contactSchedulerService: ContactSchedulerService,
  ) {}

  // TODO: we could pass a Cron string
  /**
   * Starts the fetching job.
   *
   * @param fromId filtering start id
   */
  async startJob(fromId: string): Promise<WorkerStatus> {
    Logger.debug(`Starting the scheduler.`);
    return await this.contactSchedulerService.startContactReaderJob(fromId);
  }

  /**
   * Stops the fetching job.
   */
  async stopJob(): Promise<WorkerStatus> {
    Logger.debug(`Stopping the scheduler.`);
    return await this.contactSchedulerService.stopContactReaderJob();
  }
}
