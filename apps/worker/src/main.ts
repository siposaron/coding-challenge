import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { natsConfig } from './config/nats.config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    natsConfig,
  );
  app.listen(async () => {
    console.log('Worker is listening');
  });
}

bootstrap();
