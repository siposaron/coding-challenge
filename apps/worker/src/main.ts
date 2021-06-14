import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      // Setup communication protocol here
    },
  );
  app.listen(async () => {
    console.log('Worker is listening');
  });
}
bootstrap();
