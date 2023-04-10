import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, pluck } from 'rxjs';
import { AddPlayersDto } from '../dtos/add-players.dto';

@Injectable()
export class PlayerService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(PlayerService.name);

  /**
   * Constructor
   * @param {HttpService} httpService
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Add players to existed tournament
   * @param {string | number} tournamentId
   * @param {CreateTournamentDto} data
   * @return Promise<AxiosResponse> response
   */
  public async add(
    tournamentId: string | number,
    data: AddPlayersDto[],
  ): Promise<AxiosResponse> {
    const path = `/tournaments/${tournamentId}/participants/bulk_add.json`;
    const body = {
      participants: data,
    };
    try {
      const request = this.httpService.post(path, body).pipe(pluck('data'));
      return await firstValueFrom(request);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
