import { Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { WorkerStatus } from '../commons/worker-status.enum';
import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';

@Injectable()
export class DataStreamService {
  private readonly logger = new Logger(DataStreamService.name);

  constructor(@Inject('WORKER_SERVICE') private readonly client: ClientProxy) {}

  updateWorker(startJobDto: StartJobDto): Observable<WorkerStatus> {
    return this.client.send<WorkerStatus, StartJobDto>(
      { cmd: 'startWorkerJob' },
      startJobDto,
    );
  }

  async startJob(startJobDto: StartJobDto): Promise<boolean> {
    this.logger.debug(`Start the job. ${JSON.stringify(startJobDto)}`);
    // TODO: start the remote worker job
    return true;
  }

  async stopJob(stopJobDto: StopJobDto): Promise<boolean> {
    this.logger.debug(`Stop the job. ${JSON.stringify(stopJobDto)}`);
    // TODO: stop the remote worker job
    return true;
  }
}
