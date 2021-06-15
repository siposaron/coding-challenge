import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { natsConfig } from './config/nats.config';
import { DataStreamModule } from './data-stream.module';

const initMicroservice = async (app: INestApplication) => {
  app.connectMicroservice(natsConfig);
  await app.startAllMicroservicesAsync();
};

const initSwagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('Data streams')
    .setDescription('Data streams from Hubspot')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [],
  });
  SwaggerModule.setup('api-doc', app, document);
};

const initRestControllers = (app: INestApplication) => {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );
};

async function bootstrap() {
  const app = await NestFactory.create(DataStreamModule);
  initRestControllers(app);
  initSwagger(app);
  initMicroservice(app);
  await app.listen(3000);
}

bootstrap();
