import { registerAs } from '@nestjs/config';
import { MemoryDbStorageConfigType } from './types/memorydb-storage.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'memoryDb',
  (): MemoryDbStorageConfigType => ({
    /**
     * Get Memory Db namespace size
     * @return number
     */
    getDbNamespaceSize: (): number =>
      parseInt(getEnv('MEMORY_DB_NAMESPACE_SIZE', true)),

    /**
     * Get Memory Db pool size
     * @return number
     */
    getDbSize: (): number => parseInt(getEnv('MEMORY_DB_SIZE', true)),
  }),
);
