import { Controller, Get, HttpStatus, Inject, Render } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { ServerDto } from './common/dtos/server.dto';
import { apiConfig } from './configs';
import { WorldCupTournamentService } from './modules/telegram/services/world-cup-tournament.service';
import { MatchStateEnum } from './modules/tournament/enums/match-state.enum';
import { MatchService } from './modules/tournament/services/match.service';

@ApiTags('Service API')
@Controller()
export class AppController {
  constructor(
    @Inject(apiConfig.KEY)
    private config: ConfigType<typeof apiConfig>,
    private readonly wcTournamentService: WorldCupTournamentService,
    private readonly matchService: MatchService,
  ) {}

  @Get('/')
  @Public()
  @ApiOperation({ summary: 'Health' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
    description: 'Get application info',
  })
  async getHealth(): Promise<object> {
    return {
      application: this.config.getName(),
      version: this.config.getVersion(),
      environment: this.config.getEnvironment(),
      serverTime: new Date().toISOString(),
    };
  }

  @Get('/create')
  @Public()
  @ApiOperation({ summary: 'Test' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
    description: 'Test',
  })
  async createWcTournament(): Promise<any> {
    const created = await this.wcTournamentService.createTournament(
      `Чемпіонат Світу 1998`,
      1998,
    );
    return await this.wcTournamentService.startTournament(created.url);
  }

  @Public()
  @Get('/match')
  @ApiOperation({ summary: 'Development guide UI' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
  })
  async getWcMatches(): Promise<any> {
    return await this.matchService.list({
      state: MatchStateEnum.ALL,
      tournamentId: 'nezlamni_1681003646045',
    });
  }
}
