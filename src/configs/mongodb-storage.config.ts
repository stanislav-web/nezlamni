import { registerAs } from '@nestjs/config';
import { MemoryDbStorageConfigType } from './types/memorydb-storage.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';
import {MongodbStorageConfigType} from "./types/mongodb-storage.config.type";

export default registerAs(
  'mongoDb',
  (): MongodbStorageConfigType => ({

      /**
       * Get Database connection string
       * @return string
       */
      getDbConnectionString:(): string => getEnv('MONGO_CONNECTION_STRING', true),

      /**
       * Is authentication enabled
       * @return boolean
       */
      isDbAuthenticationEnabled:(): boolean => getEnv('MONGO_AUTHENTICATION', true) === 'true',

      /**
       * Is keep-alive mode enabled
       * @return boolean
       */
      isDbKeepAliveEnabled:(): boolean => getEnv('MONGO_KEEP_ALIVE', true) === 'true',

      /**
       * Is auto reconnect enabled
       * @return boolean
       */
      isDbAutoReconnectEnabled:(): boolean => getEnv('MONGO_AUTO_RECONNECT', true) === 'true',

      /**
       * Get db logger level
       * @return string
       */
      getDbLoggerLevel:(): string => getEnv('MONGO_LOGGER_LEVEL', true),

      /**
       * Get db user name
       * @return string
       */
      getDbUsername:(): string => getEnv('MONGO_USERNAME', true),

      /**
       * Get db password
       * @return string
       */
      getDbPassword:(): string => getEnv('MONGO_PASSWORD', true),

      /**
       * Get db collection name
       * @return string
       */
      getDbCollectionName:(): string => getEnv('MONGO_COLLECTION', true),

        /**
         * Is db collection indexed automatically
         * Set to false to disable automatic index creation for all models associated with this connection.
         * @return boolean
         */
        isDbCollectionAutoIndexEnabled:(): boolean => getEnv('MONGO_COLLECTION_AUTOINDEX', true) === 'true',

        /**
         * Is db collection auto create on model create
         * Set to `true` to make Mongoose automatically call `createCollection()` on every model created on this connection.
         * @return boolean
         */
        isDbCollectionAutoCreateEnabled:(): boolean => getEnv('MONGO_COLLECTION_AUTOCREATE', true) === 'true',

        /**
         * Get database connection retries
         * @return number
         */
        getDbConnectionRetries:(): number => parseInt(getEnv('MONGO_CONNECT_RETRIES', true)),

        /**
         * Get database connection retries delay
         * @return number
         */
        getDbConnectionRetriesDelay:(): number => parseInt(getEnv('MONGO_CONNECT_RETRIES_DELAY', true)),
  }),
);
