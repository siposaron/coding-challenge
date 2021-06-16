import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';

export enum WorkerEvents {
  WorkerStarted = 'worker.started',
  WorkerStopped = 'worker.stopped',
}

export class WorkerStartedEvent {
  stratJob: StartJobDto;
}

export class WorkerStoppedEvent {
  stopJob: StopJobDto;
}
