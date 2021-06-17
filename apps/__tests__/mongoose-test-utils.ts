import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; // download timeout

let mongod: MongoMemoryServer;

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

export const rootMongooseTestModule = () =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = new MongoMemoryServer({
        //binary: { version: '4.4.0', arch: 'x64', platform: 'darwin' }, // uncomment this line on MacBook M1, run with Rosetta
      });
      const mongoUri = await mongod.getUri();
      return {
        uri: mongoUri,
        ...mongoConnectionOptions,
      };
    },
  });

export const closeMongoConnection = async () => {
  if (mongod) await mongod.stop();
};
