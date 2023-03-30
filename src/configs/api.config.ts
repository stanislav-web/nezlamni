import { registerAs } from '@nestjs/config';
import * as psjon from './../../package.json';
import { ApiConfigType } from './types/api.config.type';
import { EnvironmentEnum } from '../common/enums/environment.enum';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'api',
  (): ApiConfigType => ({
    /**
     * Get api name
     * @return {string}
     */
    getName: (): string => psjon.name,
    /**
     * Get api version
     * @return {string}
     */
    getVersion: (): string => psjon.version,
    /**
     * Get api environment
     * @return {string}
     */
    getEnvironment: (): string => getEnv('NODE_ENV', true),
    /**
     * Get api http port
     * @return {string}
     */
    getHttpsPort: (): number => parseInt(getEnv('HTTP_PORT', false)) || 80,

    /**
     * Is local environment
     * @return {boolean}
     */
    isLocal: (): boolean =>
      getEnv('NODE_ENV', false) === EnvironmentEnum.LOCALHOST,

    /**
     * Get api version
     * @return {string}
     */
    isDevelopment: (): boolean =>
      getEnv('NODE_ENV', false) === EnvironmentEnum.DEVELOPMENT,

    /**
     * Is production environment
     * @return {boolean}
     */
    isProduction: (): boolean =>
      getEnv('NODE_ENV', false) === EnvironmentEnum.PRODUCTION,

    /**
     * Is logger enabled
     * @return {boolean}
     */
    isLoggerEnabled: (): boolean => getEnv('NODE_LOGGER', false) === 'true',
  }),
);
