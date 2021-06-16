import { WorkerEvent } from '../schemas/worker-event.schema';

export enum WorkerEvents {
  ChangeWorkerState = 'change.worker.state',
}

export class ChangeWorkerStateEvent {
  workerEvent: WorkerEvent;
}
