import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MatchService } from './services/match.service';
import { PlayerService } from './services/player.service';
import { TournamentService } from './services/tournament.service';
import { tournamentConfig } from '../../configs';

@Module({
  providers: [TournamentService, MatchService, PlayerService],
  imports: [
    HttpModule.register({
      baseURL: tournamentConfig().getApiEndpoint(),
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        api_key: tournamentConfig().getApiKey(),
      },
      timeout: tournamentConfig().getApiResponseTimeout(),
      responseType: tournamentConfig().getApiResponseType(),
    }),
  ],
  exports: [TournamentService, MatchService, PlayerService],
})
export class TournamentModule {}
