import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerRepository } from './repositories/player.repository';
import { TournamentRepository } from './repositories/tournament.repository';
import { Player, PlayerSchema } from './schemas/player.schema';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { NezlamniBotService } from './services/nezlamni-bot.service';
import { TournamentBotService } from './services/tournament-bot.service';
import { apiConfig, mongoDbStorageConfig, telegramConfig } from '../../configs';
import { StorageModule } from '../storage/storage.module';
import { TournamentModule } from '../tournament/tournament.module';

@Module({
  providers: [
    PlayerRepository,
    TournamentRepository,
    NezlamniBotService,
    TournamentBotService,
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
      { name: Tournament.name, schema: TournamentSchema },
    ]),
    ConfigModule.forRoot({
      load: [telegramConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [NezlamniBotService, TournamentBotService],
})
export class TelegramModule {}
