import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { WorkerStatus } from '../commons/worker-status.enum';
import { StartJobDto } from '../dto/start-job.dto';
import { WorkerService } from '../services/worker.service';

@Controller()
export class WorkerController {
  private readonly logger = new Logger(WorkerController.name);

  constructor(private readonly workerService: WorkerService) {}

  @MessagePattern({ cmd: 'startWorkerJob' })
  async startWorkerJob(startJobDto: StartJobDto): Promise<WorkerStatus> {
    this.logger.debug(
      `Starting the workerJob. Received message: ${JSON.stringify(
        startJobDto,
      )}`,
    );
    return await this.workerService.startJob(startJobDto.fromDate);
  }
}
