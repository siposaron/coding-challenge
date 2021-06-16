import { Injectable, Logger } from '@nestjs/common';
import { WorkerStatus } from '../commons/worker-status.enum';
import { ContactSchedulerService } from './contact.scheduler.service';

@Injectable()
export class WorkerService {
  constructor(
    private readonly contactSchedulerService: ContactSchedulerService,
  ) {}

  /**
   * Starts the fetching job.
   *
   * @param fromDate filtering start date
   */
  async startJob(fromDate: Date): Promise<WorkerStatus> {
    Logger.debug(`Starting the scheduler.`);
    return await this.contactSchedulerService.startContactReaderJob(fromDate);
  }

  /**
   * Stops the fetching job.
   */
  async stopJob(): Promise<WorkerStatus> {
    Logger.debug(`Stopping the scheduler.`);
    return await this.contactSchedulerService.stopContactReaderJob();
  }
}
