import { registerAs } from '@nestjs/config';
import { CorsConfigType } from './types/cors.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'cors',
  (): CorsConfigType => ({
    /**
     * Get CORS allowed headers
     * @return string
     */
    getAllowedHeaders: (): string => getEnv('CORS_ALLOWED_HEADERS', true),

    /**
     * Get CORS allowed methods
     * @return string[] | string
     */
    getAllowedMethods: (): string[] | string => {
      const methods: string = getEnv('CORS_ALLOWED_METHODS', true);
      return methods.split(',').map((s) => s.trim());
    },

    /**
     * Get CORS allowed domains
     * @return string[] | string
     */
    getAllowedOrigins: (): string[] | string => {
      const domains: string = getEnv('CORS_ALLOWED_DOMAINS', true);
      let origins;
      if ('*' !== domains) {
        origins = domains.split(',').map((s) => s.trim());
      }
      return origins || domains;
    },

    /**
     * Get CORS exposed headers
     * @return string
     */
    getExposedHeaders: (): string => getEnv('CORS_EXPOSED_HEADERS', true),

    /**
     * Is credentials required
     * @return boolean
     */
    requireCredentials: (): boolean =>
      getEnv('CORS_CREDENTIALS', true) === 'true',
  }),
);
