import {
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { WorkerStatus } from '../commons/worker-status.enum';
import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';
import { WorkerService } from '../services/worker.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class WorkerController {
  private readonly logger = new Logger(WorkerController.name);

  constructor(
    @Inject('DATA_STREAMS_SERVICE') private readonly client: ClientProxy,
    private readonly workerService: WorkerService,
  ) {}

  @MessagePattern({ cmd: 'start.worker' })
  async startWorkerJob(startJobDto: StartJobDto): Promise<WorkerStatus> {
    this.logger.debug(
      `Starting the workerJob. Received message: ${JSON.stringify(
        startJobDto,
      )}`,
    );
    const fromDate = startJobDto.fromDate
      ? new Date(Date.parse(startJobDto.fromDate))
      : null;
    return await this.workerService.startJob(fromDate);
  }

  @MessagePattern({ cmd: 'stop.worker' })
  async stopWorkerJob(startJobDto: StopJobDto): Promise<WorkerStatus> {
    this.logger.debug(
      `Stopping the workerJob. Received message: ${JSON.stringify(
        startJobDto,
      )}`,
    );
    return await this.workerService.stopJob();
  }
}
