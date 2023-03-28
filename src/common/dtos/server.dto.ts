import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EnvironmentEnum } from '../enums/environment.enum';

export class ServerDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  application: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  version: string;

  @ApiProperty({
    enum: EnvironmentEnum,
    isArray: false,
    required: true,
    example: EnvironmentEnum.DEVELOPMENT,
  })
  @IsNotEmpty()
  @IsEnum(EnvironmentEnum)
  environment: EnvironmentEnum;

  @ApiProperty({ type: Number, default: new Date() })
  readonly serverTime: Date = new Date();
}
