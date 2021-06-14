import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactCountDto } from '../dto/contact-count.dto';
import { Contact } from '../schemas/contact.schema';
import { ContactService } from '../services/contact.service';

// TODO: future work: add authentication, JWT authorization, job CRUD + scheduler that sends start / stop jobs events to worker
@Controller('/api/contacts')
@UseInterceptors(ClassSerializerInterceptor)
export class ContactsController {
  constructor(private readonly contactService: ContactService) {}

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
    return await this.contactService.countContacts();
  }

  @ApiOkResponse({
    type: ContactCountDto,
    description: 'Returns the list of contacts.',
  })
  @ApiBadRequestResponse({
    description: 'Bad request, validation failed. Check the input data',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal service error. Check the logs for more info.',
  })
  @ApiQuery({
    name: 'offset',
    allowEmptyValue: true,
    required: false,
    example: 0,
  })
  @ApiQuery({
    name: 'limit',
    allowEmptyValue: true,
    required: false,
    example: 10,
  })
  @Get()
  async listContacts(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
  ): Promise<Contact[]> {
    return await this.contactService.listContacts(offset, limit);
  }
}
