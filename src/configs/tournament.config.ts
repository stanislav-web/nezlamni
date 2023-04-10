import { registerAs } from '@nestjs/config';
import { ResponseType } from 'axios';
import { TournamentConfigType } from './types/tournament.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'tournament',
  (): TournamentConfigType => ({
    /**
     * Get tournament API endpoint
     * @return string
     */
    getApiEndpoint: (): string => getEnv('TOURNAMENT_API_ENDPOINT', true),

    /**
     * Get tournament API response type
     * @return ResponseType
     */
    getApiResponseType: (): ResponseType =>
      getEnv('TOURNAMENT_API_RESPONSE_TYPE', true) as ResponseType,

    /**
     * Get tournament API key
     * @return string
     */
    getApiKey: (): string => getEnv('TOURNAMENT_API_KEY', true),

    /**
     * Get tournament url prefix
     * @return string
     */
    getTournamentUrlPrefix: (): string => getEnv('TOURNAMENT_URL_PREFIX', true),

    /**
     * Get API response timeout
     * @return number
     */
    getApiResponseTimeout: (): number =>
      parseInt(getEnv('TOURNAMENT_API_RESPONSE_TIMEOUT_MS', true)),

    /**
     * Get tournament start after hours
     * @return number
     */
    getTournamentDefaultStartAfterHours: (): number =>
      parseInt(getEnv('TOURNAMENT_DEFAULT_START_AFTER_HOURS', true)),
  }),
);
