import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WorkerStatus } from '../commons/worker-status.enum';
import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';
import { DataStreamService } from '../services/data-stream.service';

// TODO: future work: add authentication, JWT authorization, job CRUD + scheduler that sends start / stop jobs events to worker
@Controller('/api/streams')
@UseInterceptors(ClassSerializerInterceptor)
export class DataStreamController {
  private readonly logger = new Logger(DataStreamController.name);

  constructor(private readonly dataStreamService: DataStreamService) {}

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
    return this.dataStreamService
      .updateWorker(startJobDto)
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
  async stopJob(
    @Body()
    stopJobDto: StopJobDto,
  ) {
    return await this.dataStreamService.stopJob(stopJobDto);
  }
}
