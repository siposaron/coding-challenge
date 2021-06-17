import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NatsContext } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../../../__tests__/mongoose-test-utils';
import { DataSource } from '../../commons/datasource.enum';
import { ProcessingStatus } from '../../commons/processing-status.enum';
import { ContactDto } from '../../dto/contact.dto';
import { generateContactDtoMocks } from '../../dto/__mocks__/contact.dto.mock';
import {
  Contact,
  ContactDocument,
  ContactFeature,
} from '../../schemas/contact.schema';
import { ImportMetricsFeature } from '../../schemas/import-metrics.schema';
import { ContactService } from '../../services/contact.service';
import { DataStreamService } from '../../services/data-stream.service';
import { DataStreamServiceMock } from '../../services/__mocks__/data-stream.service.mock';
import { ImportContactsController } from '../import-contacts.controller';

describe('Import contacts controller', () => {
  let controller: ImportContactsController;
  let contactService: ContactService;
  let contactModel: Model<ContactDocument>;
  const contactDtos = generateContactDtoMocks();
  const natsContext = new NatsContext(['subject']);

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'apps/__tests__/test.env',
        }),
        rootMongooseTestModule(),
        MongooseModule.forFeatureAsync([ContactFeature, ImportMetricsFeature]),
        EventEmitterModule.forRoot(),
      ],
      controllers: [ImportContactsController],
      providers: [
        { provide: DataStreamService, useClass: DataStreamServiceMock },
        ContactService,
      ],
    }).compile();

    controller = module.get<ImportContactsController>(ImportContactsController);
    contactService = module.get<ContactService>(ContactService);
    contactModel = module.get<Model<ContactDocument>>(Contact.name + 'Model');
  });

  const assertContact = (actual: Contact, expected: ContactDto) => {
    expect(actual.email).toBe(expected.email);
    expect(actual.firstName).toBe(expected.firstName);
    expect(actual.lastName).toBe(expected.lastName);
    expect(actual.foreignId).toBe(expected.id);
    expect(actual.dataSource).toBe(DataSource.HubSpot);
    expect(actual.foreignCreateDate).toBeDefined();
    expect(actual.foreignModifyDate).toBeDefined();
    expect(actual.createdAt).toBeDefined();
    expect(actual.updatedAt).toBeDefined();
  };

  it('should import contacts', async () => {
    const status = await controller.importContactsFromWorker(
      contactDtos,
      natsContext,
    );
    expect(status).toBe(ProcessingStatus.Ok);

    const numberOfContacts = await contactService.countContacts();
    expect(numberOfContacts.count).toBe(contactDtos.length);

    const contacts = await contactService.listContacts(0, 1);
    const contact = contacts[0];
    const contactDto = contactDtos.find((c) => c.id === contact.foreignId);
    assertContact(contact, contactDto);
  });

  it('should not import contacts when import service throws exception', async () => {
    // fail on 1 contact import
    jest.spyOn(contactModel, 'findOneAndUpdate').mockImplementationOnce(() => {
      throw new Error();
    });

    const status = await controller.importContactsFromWorker(
      contactDtos,
      natsContext,
    );
    // if 1 import fails, the processing status becomes NOk
    expect(status).toBe(ProcessingStatus.NOk);

    const numberOfContacts = await contactService.countContacts();
    expect(numberOfContacts.count).toBe(contactDtos.length - 1);
  });

  afterEach(async () => {
    await contactModel.deleteMany({}).exec();
  });

  afterAll(async () => {
    await closeMongoConnection();
  });
});
