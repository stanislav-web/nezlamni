import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NezlamniBotService } from './services/nezlamni-bot.service';
import { apiConfig, telegramConfig } from '../../configs';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [NezlamniBotService],
  imports: [
    StorageModule,
    MongooseModule.forRoot('mongodb://locadlhost/demo', {
      retryAttempts: 3,
      retryDelay: 10,
      connectionName: 'TEST',
      /** The name of the database you want to use. If not provided, Mongoose uses the database name from connection string. */
      dbName?: string;
      /** username for authentication, equivalent to `options.auth.user`. Maintained for backwards compatibility. */
      user?: string;
      /** password for authentication, equivalent to `options.auth.password`. Maintained for backwards compatibility. */
      pass?: string;
      /** Set to false to disable automatic index creation for all models associated with this connection. */
      autoIndex?: boolean;
      /** Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection. */
      autoCreate?: boolean;
    }),
    ConfigModule.forRoot({
      load: [telegramConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [NezlamniBotService],
})
export class TelegramModule {}
