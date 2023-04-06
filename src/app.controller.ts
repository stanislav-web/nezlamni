import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './common/decorators/public.decorator';
import { ServerDto } from './common/dtos/server.dto';
import { apiConfig } from './configs';
import { TournamentTypeEnum } from './modules/telegram/enums/tournament-type.enum';
import { TournamentBotService } from './modules/telegram/services/tournament-bot.service';

@ApiTags('Service API')
@Controller()
export class AppController {
  constructor(
    @Inject(apiConfig.KEY)
    private config: ConfigType<typeof apiConfig>,
    private readonly tournamentBotService: TournamentBotService,
  ) {}
  @Get('/a')
  @Public()
  @ApiOperation({ summary: 'Health' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
    description: 'Get application info',
  })
  async getHealth(): Promise<object> {
    await this.tournamentBotService.createTournament(
      'League Champions',
      TournamentTypeEnum.CHAMPIONSHIP,
      4,
      true,
      new Date(),
      new Date(),
    );
    return {
      application: this.config.getName(),
      version: this.config.getVersion(),
      environment: this.config.getEnvironment(),
      serverTime: new Date().toISOString(),
    };
  }

  @Public()
  @Get('/documentation')
  @ApiOperation({ summary: 'Development guide UI' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
  })
  getDocumentation(@Res() res: Response) {
    res.sendFile('index.html', {
      root: join(__dirname, '../', '../', 'documentation'),
    });
  }
}
