import { Controller } from '@nestjs/common';
import { WorkerService } from './services/worker.service';

@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  getHello(): string {
    return;
  }
}
