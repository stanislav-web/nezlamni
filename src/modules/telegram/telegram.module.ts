import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NezlamniBotService } from './services/nezlamni-bot.service';
import {apiConfig, mongoDbStorageConfig, telegramConfig} from '../../configs';
import { StorageModule } from '../storage/storage.module';
import {MongooseModule} from "@nestjs/mongoose";
import {Player, PlayerSchema} from "./schemas/player.schema";
import {PlayerRepository} from "./repositories/player.repository";

@Module({
  providers: [PlayerRepository, NezlamniBotService],
  imports: [
    StorageModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: mongoDbStorageConfig().getDbConnectionString(),
        retryAttempts: mongoDbStorageConfig().getDbConnectionRetries(),
        retryDelay: mongoDbStorageConfig().getDbConnectionRetriesDelay(),
        appName: apiConfig().getEnvironment(),
        dbName: mongoDbStorageConfig().getDbCollectionName(),
        user:  mongoDbStorageConfig().getDbUsername(),
        pass: mongoDbStorageConfig().getDbPassword(),
        autoIndex: mongoDbStorageConfig().isDbCollectionAutoIndexEnabled(),
        autoCreate: mongoDbStorageConfig().isDbCollectionAutoCreateEnabled(),
      })}),
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    ConfigModule.forRoot({
      load: [telegramConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [NezlamniBotService],
})
export class TelegramModule {}
