import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { ExceptionFilter } from './common/filters/exception.filter';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import {apiConfig, mongoDbStorageConfig} from './configs';
import { TelegramModule } from './modules/telegram/telegram.module';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig],
      cache: apiConfig().isProduction() === true,
    }),
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    if (!apiConfig().isProduction())
      consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
