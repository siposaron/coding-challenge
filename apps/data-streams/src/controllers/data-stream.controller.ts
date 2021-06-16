import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WorkerIntent } from '../commons/worker-intent.enum';
import { WorkerStatus } from '../commons/worker-status.enum';
import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';
import { ChangeWorkerStateEvent, WorkerEvents } from '../events/worker.events';
import { WorkerEvent } from '../schemas/worker-event.schema';
import { DataStreamService } from '../services/data-stream.service';

// TODO: future work: add authentication, JWT authorization, job CRUD + scheduler that sends start / stop jobs events to worker
@Controller('/api/streams')
@UseInterceptors(ClassSerializerInterceptor)
export class DataStreamController {
  private readonly logger = new Logger(DataStreamController.name);

  constructor(
    private readonly dataStreamService: DataStreamService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @ApiOkResponse({
    description: 'Starts the fetch job in worker.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request, validation failed. Check the input data',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal service error. Check the logs for more info.',
  })
  @Post('/start')
  startJob(
    @Body()
    startJobDto: StartJobDto,
  ): Observable<WorkerStatus> {
    // raise event to save worker change state
    this.eventEmitter.emitAsync(WorkerEvents.ChangeWorkerState, {
      workerEvent: {
        objectType: startJobDto.objectType,
        dataSource: startJobDto.dataSource,
        workerIntent: WorkerIntent.Start,
      } as WorkerEvent,
    } as ChangeWorkerStateEvent);

    return this.dataStreamService
      .startJob(startJobDto)
      .pipe(
        tap((jobStatus) => this.logger.debug(`Worker status: ${jobStatus}`)),
      );
  }

  @ApiOkResponse({
    description: 'Stops the fetch job in worker.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request, validation failed. Check the input data',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal service error. Check the logs for more info.',
  })
  @Post('/stop')
  stopJob(
    @Body()
    stopJobDto: StopJobDto,
  ): Observable<WorkerStatus> {
    // raise event to save worker change state
    this.eventEmitter.emitAsync(WorkerEvents.ChangeWorkerState, {
      workerEvent: {
        objectType: stopJobDto.objectType,
        dataSource: stopJobDto.dataSource,
        workerIntent: WorkerIntent.Stop,
      } as WorkerEvent,
    } as ChangeWorkerStateEvent);

    return this.dataStreamService
      .stopJob(stopJobDto)
      .pipe(
        tap((jobStatus) => this.logger.debug(`Worker status: ${jobStatus}`)),
      );
  }
}
