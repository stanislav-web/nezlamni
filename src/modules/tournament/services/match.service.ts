import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, pluck } from 'rxjs';
import { toQueryString } from '../../../common/utils/object.util';
import { MatchStateEnum } from '../enums/match-state.enum';

@Injectable()
export class MatchService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(MatchService.name);

  /**
   * Constructor
   * @param {HttpService} httpService
   */
  constructor(private readonly httpService: HttpService) {}

  /**
   * Tournament match list
   * @param {tournamentId: string | number, state?: MatchStateEnum, participantId?: number} filter
   * @return Promise<[]>
   */
  public async list(filter: {
    state?: MatchStateEnum;
    tournamentId: string | number;
  }): Promise<[]> {
    const { tournamentId, state } = filter;
    const params = {
      state,
    };
    const path = `/tournaments/${tournamentId}/matches.json?${toQueryString(
      params,
    )}`;

    try {
      const request = this.httpService.get(path).pipe(pluck('data'));
      return await firstValueFrom(request);
    } catch (error) {
      this.logger.error(error);
    }
  }
}
