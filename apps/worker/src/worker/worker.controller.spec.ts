import { Test, TestingModule } from '@nestjs/testing';
import { WorkerController } from './worker.controller';
import { WorkerService } from './services/worker.service';
import { ContactSchedulerService } from './services/contact.scheduler.service';
import { HubspotService } from './services/hubspot/hubspot.service';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/common';

describe('WorkerController', () => {
  let workerController: WorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ScheduleModule.forRoot(),
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      controllers: [WorkerController],
      providers: [HubspotService, ContactSchedulerService, WorkerService],
    }).compile();

    workerController = app.get<WorkerController>(WorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(workerController.getHello()).toBeUndefined();
    });
  });
});
