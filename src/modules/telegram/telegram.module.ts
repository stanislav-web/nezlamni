import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NezlamniBotService } from './services/nezlamni-bot.service';
import { apiConfig, telegramConfig } from '../../configs';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [NezlamniBotService],
  imports: [
    StorageModule,
    ConfigModule.forRoot({
      load: [telegramConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [NezlamniBotService],
})
export class TelegramModule {}
