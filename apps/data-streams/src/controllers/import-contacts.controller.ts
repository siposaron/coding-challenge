import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';
import { ProcessingStatus } from '../commons/processing-status.enum';
import { ContactDto } from '../dto/contact.dto';
import { ContactService } from '../services/contact.service';

@Controller()
export class ImportContactsController {
  private readonly logger = new Logger(ImportContactsController.name);

  constructor(private readonly contactService: ContactService) {}

  @MessagePattern({ cmd: 'import.contacts' })
  async importContactsFromWorker(
    @Payload() contactDtos: ContactDto[],
    @Ctx() context: NatsContext,
  ): Promise<ProcessingStatus> {
    this.logger.log(
      `Number of contacts received: ${JSON.stringify(
        contactDtos.length,
      )} in context ${context.getSubject()}`,
    );
    return await this.contactService.importContacts(contactDtos);
  }
}
