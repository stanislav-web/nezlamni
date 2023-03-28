import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemoryDbStorageProvider } from './providers/memory-db.provider';
import { apiConfig, memoryDbStorageConfig } from '../../configs';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  providers: [
    {
      provide: MemoryDbStorageProvider,
      useFactory: async () => {
        const pool = {};
        return new MemoryDbStorageProvider(
          'TelegramMemoryDb',
          pool,
          memoryDbStorageConfig(),
        );
      },
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [memoryDbStorageConfig],
      cache: apiConfig().isProduction() === true,
    }),
    MongooseModule.forRoot('mongodb://locadlhost/demo', {
      retryAttempts: 3,
      retryDelay: 10,
      connectionName: 'TEST',
      /** The name of the database you want to use. If not provided, Mongoose uses the database name from connection string. */
      dbName: '',
      /** username for authentication, equivalent to `options.auth.user`. Maintained for backwards compatibility. */
      user:  '',
      /** password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility. */
      pass: '',
      /** Set to false to disable automatic index creation for all models associated with this connection. */
      autoIndex: true,
      /** Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection. */
      autoCreate: true,
    }),
  ],
  exports: [MemoryDbStorageProvider],
})
export class StorageModule {}
