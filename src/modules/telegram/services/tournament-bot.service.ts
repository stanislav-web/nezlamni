import { Inject, Injectable, Logger } from '@nestjs/common';

import { BracketsManager } from 'brackets-manager';
import { addProps } from '../../../common/utils/array.util';
import { BracketsProvider } from '../../storage/providers/brackets.provider';
import { GroupStageService } from '../../tournament/services/group-stage.service';
import { TournamentStatusEnum } from '../enums/tournament-status.enum';
import { TournamentTypeEnum } from '../enums/tournament-type.enum';
import { PlayerRepository } from '../repositories/player.repository';
import { TournamentRepository } from '../repositories/tournament.repository';

@Injectable()
export class TournamentBotService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(TournamentBotService.name);

  /**
   * Constructor
   * @param {GroupStageService} groupStageService
   * @param {PlayerRepository} playerRepository
   * @param {TournamentRepository} tournamentRepository
   */
  constructor(
    @Inject(GroupStageService)
    private readonly groupStageService: GroupStageService,
    @Inject(PlayerRepository)
    private readonly playerRepository: PlayerRepository,
    @Inject(TournamentRepository)
    private readonly tournamentRepository: TournamentRepository,
  ) {}

  /**
   * Create tournament
   * @param {string} title
   * @param {TournamentTypeEnum} type
   * @param {number} groupSize
   * @param {boolean} isMarked
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {string} logo
   */
  async createTournament(
    title: string,
    type: TournamentTypeEnum,
    groupSize: number,
    isMarked: boolean,
    startDate: Date,
    endDate: Date,
    logo = '',
  ) {
    // 1. Declare variables
    title = title.trim();
    const status =
      startDate > new Date()
        ? TournamentStatusEnum.PLANNED
        : TournamentStatusEnum.OPEN;

    // try {
    // 2. Get all players
    const players = await this.playerRepository.findAll();
    const buckets = this.groupStageService.generateBuckets(
      players,
      groupSize,
      true,
    );
    this.logger.log('BUCKETS', buckets);

    // 4. Create tournament in DB
    const tournament = await this.tournamentRepository.create({
      title,
      type,
      startDate,
      endDate,
      logo,
      status,
    });
    this.logger.log('MONGO CREATED TOURNAMENT', tournament);

    const playersStage = [
      ...players.map((player) => ({
        id: player.telegramUserId,
        tournament_id: tournament.tournamentId,
        name: player.playerNickname,
      })),
    ];
    this.logger.log('PLAYERS STAGE', playersStage);
    const manager = new BracketsManager(new BracketsProvider());
    const stage = await manager.create({
      name: title,
      tournamentId: tournament.tournamentId,
      type: 'round_robin',
      seeding: playersStage,
      settings: {
        groupCount: groupSize,
        size: players.length,
        balanceByes: true,
        consolationFinal: true,
        seedOrdering: ['groups.effort_balanced'],
        // grandFinal: 'simple',
        // roundRobinMode: 'double',
      },
    });
    this.logger.log('BRACKETS STAGE', stage);
    return buckets;
    // } catch (error) {
    //   this.logger.error(error);
    //   //@TODO Error handler
    // }
  }
}
