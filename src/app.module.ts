import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';

import { AppController } from './app.controller';
import { ExceptionFilter } from './common/filters/exception.filter';
import { RequestLoggerMiddleware } from './common/middlewares/request-logger.middleware';
import { apiConfig } from './configs';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TournamentModule } from './modules/tournament/tournament.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [apiConfig],
      cache: apiConfig().isProduction() === true,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve('./', 'data'),
      serveRoot: resolve('/', 'data'),
      serveStaticOptions: {
        extensions: ['png'],
      },
    }),
    TournamentModule,
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
