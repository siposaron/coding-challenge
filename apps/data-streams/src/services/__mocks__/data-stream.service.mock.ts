import { Observable, of } from 'rxjs';
import { WorkerStatus } from '../../commons/worker-status.enum';
import { StartJobDto } from '../../dto/start-job.dto';
import { StopJobDto } from '../../dto/stop-job.dto';

export class DataStreamServiceMock {
  startJob(startJobDto: StartJobDto): Observable<WorkerStatus> {
    return of(WorkerStatus.Started);
  }

  stopJob(stopJobDto: StopJobDto): Observable<WorkerStatus> {
    return of(WorkerStatus.Stopped);
  }
}
