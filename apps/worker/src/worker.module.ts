import { Module } from '@nestjs/common';
import { WorkerController } from './controllers/worker.controller';
import { HttpModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HubspotService } from './services/hubspot/hubspot.service';
import { ContactSchedulerService } from './services/contact.scheduler.service';
import { WorkerService } from './services/worker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [WorkerController],
  providers: [HubspotService, ContactSchedulerService, WorkerService],
})
export class WorkerModule {}
