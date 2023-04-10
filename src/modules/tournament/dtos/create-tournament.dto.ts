import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ToBoolean } from '../../../common/transformers/to-boolean.transformer';
import { TournamentGameEnum } from '../enums/tournament-game.enum';
import { TournamentRankEnum } from '../enums/tournament-rank.enum';
import { TournamentTypeEnum } from '../enums/tournament-type.enum';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 60)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 60)
  @Transform(({ value }) => value.trim())
  url: string;

  @IsNotEmpty()
  @IsEnum(TournamentTypeEnum)
  type: TournamentTypeEnum;

  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  @Transform(({ value }) => value.trim())
  description: string;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(TournamentGameEnum)
  game?: TournamentGameEnum = TournamentGameEnum.FOOTBALL;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(TournamentRankEnum)
  rankedBy?: TournamentRankEnum = TournamentRankEnum.MATCH_WINS;

  @ToBoolean()
  isOpenSignup: boolean;

  @ToBoolean()
  @IsOptional()
  isThirdPlaceMatchHold?: boolean = true;

  @ToBoolean()
  @IsOptional()
  isGroupStageEnabled?: boolean = true;

  @ToBoolean()
  @IsOptional()
  isAttachmentsAllowed?: boolean = true;

  @ToBoolean()
  @IsOptional()
  isRoundsShowed?: boolean = true;

  @ToBoolean()
  @IsOptional()
  isPrivate?: boolean = true;

  @IsNumber()
  @IsOptional()
  @Min(4)
  @Max(32)
  @Type(() => Number)
  signupCapacity?: number;

  @IsDateString()
  @IsOptional()
  startAt?: string;
}
