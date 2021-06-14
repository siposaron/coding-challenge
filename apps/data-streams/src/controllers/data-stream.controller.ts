import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ContactCountDto } from '../dto/contact-count.dto';
import { StartJobDto } from '../dto/start-job.dto';
import { StopJobDto } from '../dto/stop-job.dto';
import { ContactService } from '../services/contact.service';
import { DataStreamService } from '../services/data-stream.service';

// TODO: future work: add authentication, JWT authorization, job CRUD + scheduler that sends start / stop jobs events to worker
@Controller('/api/streams')
@UseInterceptors(ClassSerializerInterceptor)
export class DataStreamController {
  constructor(
    private readonly dataStreamService: DataStreamService,
    private readonly contactService: ContactService,
  ) {}

  @ApiOkResponse({
    type: ContactCountDto,
    description: 'Returns the number of existing contacts.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request, validation failed. Check the input data',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal service error. Check the logs for more info.',
  })
  @Get('/count')
  async countContacts(): Promise<ContactCountDto> {
    // TODO: write and call service logic
    return await this.contactService.countContacts();
  }

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
  async startJob(
    @Body()
    startJobDto: StartJobDto,
  ) {
    return await this.dataStreamService.startJob(startJobDto);
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
