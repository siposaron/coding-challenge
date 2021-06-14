import { Injectable, Logger } from '@nestjs/common';
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
  async startJob(fromDate: Date) {
    Logger.debug(`Starting the scheduler.`);
    await this.contactSchedulerService.startContactReaderJob(fromDate);
  }

  /**
   * Stops the fetching job.
   */
  async stopJob() {
    Logger.debug(`Stopping the scheduler.`);
    await this.contactSchedulerService.stopContactReaderJob();
  }
}
