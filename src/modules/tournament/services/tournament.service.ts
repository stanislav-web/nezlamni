import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, pluck } from 'rxjs';
import { CreateTournamentDto } from '../dtos/create-tournament.dto';

@Injectable()
export class TournamentService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(TournamentService.name);

  /**
   * Constructor
   * @param {HttpService} httpService
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Create tournament
   * @param {CreateTournamentDto} data
   * @return Promise<{
   *     tournament: {
   *       full_challonge_url: string;
   *       id: number;
   *       live_image_url: string;
   *       url: string;
   *       state: string;
   *     };
   *   }>
   */
  public async create(data: CreateTournamentDto): Promise<{
    tournament: {
      full_challonge_url: string;
      id: number;
      live_image_url: string;
      state: string;
      url: string;
    };
  }> {
    const path = '/tournaments.json';
    const body = {
      tournament: {
        name: data.name,
        url: data.url,
        tournament_type: data.type,
        description: data.description,
        game_name: data.game,
        open_signup: data.isOpenSignup,
        group_stages_enabled: data.isGroupStageEnabled,
        hold_third_place_match: data.isThirdPlaceMatchHold,
        accept_attachments: data.isAttachmentsAllowed,
        show_rounds: data.isRoundsShowed,
        ranked_by: data.rankedBy,
        private: data.isPrivate,
        start_at: data.startAt,
      },
    };
    try {
      const request = this.httpService.post(path, body).pipe(pluck('data'));
      return await firstValueFrom(request);
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Start tournament
   * @param {string | number} tournamentId
   * @return : Promise<{
   *     tournament: {
   *       full_challonge_url: string;
   *       id: number;
   *       live_image_url: string;
   *       state: string;
   *       url: string;
   *     };
   *   }>
   */
  public async start(tournamentId: string | number): Promise<{
    tournament: {
      full_challonge_url: string;
      id: number;
      live_image_url: string;
      state: string;
      url: string;
    };
  }> {
    const path = `/tournaments/${tournamentId}/start.json`;
    const body = {
      include_participants: 1,
      include_matches: 1,
    };
    try {
      const request = this.httpService.post(path, body).pipe(pluck('data'));
      return await firstValueFrom(request);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
