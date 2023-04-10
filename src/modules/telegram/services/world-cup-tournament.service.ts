import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { addMinutes, format } from 'date-fns';
import { findInArrayInsensitive } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { tournamentConfig } from '../../../configs';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
import { TournamentGameEnum } from '../../tournament/enums/tournament-game.enum';
import { TournamentRankEnum } from '../../tournament/enums/tournament-rank.enum';
import { TournamentTypeEnum } from '../../tournament/enums/tournament-type.enum';
import { PlayerService } from '../../tournament/services/player.service';
import { TournamentService } from '../../tournament/services/tournament.service';
import { PlayerRepository } from '../repositories/player.repository';
import { WORLD_CUP_DESCRIPTION_TPL } from '../templates/world-cup.template';

@Injectable()
export class WorldCupTournamentService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(WorldCupTournamentService.name);

  /**
   * Constructor
   * @param {ConfigType<typeof tournamentConfig>} tournamentConf
   * @param {TournamentService} tournamentService
   * @param {PlayerService} playerService
   * @param {PlayerRepository} playerRepository
   */
  constructor(
    @Inject(tournamentConfig.KEY)
    private tournamentConf: ConfigType<typeof tournamentConfig>,
    @Inject(TournamentService)
    private readonly tournamentService: TournamentService,
    @Inject(PlayerService)
    private readonly playerService: PlayerService,
    @Inject(PlayerRepository)
    private readonly playerRepository: PlayerRepository,
  ) {}

  /**
   * Create World Cup Format tournament
   * @param {string} name
   * @param {string} season
   * @return Promise<AxiosResponse> response
   */
  public async createTournament(name: string, season: number): Promise<any> {
    const data = {
      name,
      url: this.tournamentConf.getTournamentUrlPrefix() + new Date().valueOf(),
      type: TournamentTypeEnum.SINGLE_ELIMINATION,
      game: TournamentGameEnum.FOOTBALL,
      description: message(WORLD_CUP_DESCRIPTION_TPL, {
        season,
      }),
      isOpenSignup: false,
      isThirdPlaceMatchHold: true,
      isGroupStageEnabled: true,
      isAttachmentsAllowed: true,
      isRoundsShowed: true,
      isPrivate: true,
      rankedBy: TournamentRankEnum.POINTS_DIFFERENCE,
      startAt: format(
        addMinutes(
          new Date(),
          this.tournamentConf.getTournamentDefaultStartAfterHours(),
        ),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
      ),
    };

    try {
      const players = await this.playerRepository.findAll({
        playerNation: { $exists: true },
      });
      const { tournament } = await this.tournamentService.create(data);
      await this.playerService.add(
        tournament.url,
        players.map((player) => {
          const country = findInArrayInsensitive(
            countries,
            'code',
            player.playerNation,
          ) as CountryListItemType;
          const nation = !isEmpty(country)
            ? `${country?.flag}`
            : `${player?.playerNation}`;
          return {
            name: `${nation} ${player.playerNickname}`,
          };
        }),
      );

      return tournament;
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Start World Cup Format tournament
   * @param {string|number} id
   * @return Promise<AxiosResponse> response
   */
  public async startTournament(id: string | number): Promise<any> {
    try {
      const { tournament } = await this.tournamentService.start(id);
      return tournament;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
