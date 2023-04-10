import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AddPlayersDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(3, 256)
  @Transform(({ value }) => value.trim())
  icon?: string;
}
