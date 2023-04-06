import { registerAs } from '@nestjs/config';
import { TournamentConfigType } from './types/tournament.config.type';

export default registerAs('tournament', (): TournamentConfigType => ({}));
