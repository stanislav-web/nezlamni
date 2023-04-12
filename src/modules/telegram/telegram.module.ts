import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerContentRepository } from './repositories/player-content.repository';
import { PlayerRepository } from './repositories/player.repository';
import {
  PlayerContent,
  PlayerContentSchema,
} from './schemas/player-content.schema';
import { Player, PlayerSchema } from './schemas/player.schema';
import { NezlamniBotService } from './services/nezlamni-bot.service';
import { WorldCupTournamentService } from './services/world-cup-tournament.service';
import {
  apiConfig,
  gameplayConfig,
  mongoDbStorageConfig,
  telegramConfig,
  tournamentConfig,
} from '../../configs';
import { StorageModule } from '../storage/storage.module';
import { TournamentModule } from '../tournament/tournament.module';

@Module({
  providers: [
    PlayerRepository,
    PlayerContentRepository,
    NezlamniBotService,
    WorldCupTournamentService,
  ],
  imports: [
    StorageModule,
    TournamentModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: mongoDbStorageConfig().getDbConnectionString(),
        retryAttempts: mongoDbStorageConfig().getDbConnectionRetries(),
        retryDelay: mongoDbStorageConfig().getDbConnectionRetriesDelay(),
        appName: apiConfig().getEnvironment(),
        dbName: mongoDbStorageConfig().getDbCollectionName(),
        user: mongoDbStorageConfig().getDbUsername(),
        pass: mongoDbStorageConfig().getDbPassword(),
        autoIndex: mongoDbStorageConfig().isDbCollectionAutoIndexEnabled(),
        autoCreate: mongoDbStorageConfig().isDbCollectionAutoCreateEnabled(),
      }),
    }),
    MongooseModule.forFeature([
      { name: Player.name, schema: PlayerSchema },
      { name: PlayerContent.name, schema: PlayerContentSchema },
    ]),
    ConfigModule.forRoot({
      load: [telegramConfig],
      cache: apiConfig().isProduction() === true,
    }),
    ConfigModule.forRoot({
      load: [tournamentConfig],
      cache: apiConfig().isProduction() === true,
    }),
    ConfigModule.forRoot({
      load: [gameplayConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [NezlamniBotService, WorldCupTournamentService],
})
export class TelegramModule {}
