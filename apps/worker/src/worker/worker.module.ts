import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './services/worker.service';
import { HttpModule } from '@nestjs/common';
import { HubspotService } from './services/hubspot.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [WorkerController],
  providers: [HubspotService, WorkerService],
})
export class WorkerModule {}
