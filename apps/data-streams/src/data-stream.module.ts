import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { natsConfig } from './config/nats.config';
import { ContactsController } from './controllers/contacts.controller';
import { DataStreamController } from './controllers/data-stream.controller';
import { ContactFeature } from './schemas/contact.schema';
import { ContactService } from './services/contact.service';
import { DataStreamService } from './services/data-stream.service';

const mongoConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  keepAlive: true,
  poolSize: 10,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  family: 4,
  useFindAndModify: false,
  useUnifiedTopology: true,
} as MongooseModuleOptions;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'WORKER_SERVICE',
        ...natsConfig,
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        ...{ uri: config.get<string>('MONGO_URI') },
        ...mongoConnectionOptions,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeatureAsync([ContactFeature]),
  ],
  controllers: [DataStreamController, ContactsController],
  providers: [DataStreamService, ContactService],
})
export class DataStreamModule {}
