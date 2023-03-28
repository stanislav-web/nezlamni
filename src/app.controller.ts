import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { join } from 'path';
import { Public } from './common/decorators/public.decorator';
import { ServerDto } from './common/dtos/server.dto';
import { apiConfig } from './configs';

@ApiTags('Service API')
@Controller()
export class AppController {
  constructor(
    @Inject(apiConfig.KEY)
    private config: ConfigType<typeof apiConfig>,
  ) {}
  @Get('/')
  @Public()
  @ApiOperation({ summary: 'Health' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ServerDto,
    description: 'Get application info',
  })
  getHealth(): object {
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
