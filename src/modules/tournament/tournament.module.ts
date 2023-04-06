import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GroupStageService } from './services/group-stage.service';
import { RequestLoggerMiddleware } from '../../common/middlewares/request-logger.middleware';
import { apiConfig, tournamentConfig } from '../../configs';

@Module({
  providers: [GroupStageService],
  imports: [
    ConfigModule.forRoot({
      load: [tournamentConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [GroupStageService],
})
export class TournamentModule {}
