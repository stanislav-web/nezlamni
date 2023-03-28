import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemoryDbStorageProvider } from './providers/memory-db.provider';
import { apiConfig, memoryDbStorageConfig } from '../../configs';

@Module({
  providers: [
    {
      provide: MemoryDbStorageProvider,
      useFactory: async () => {
        const pool = {};
        return new MemoryDbStorageProvider(
          'TelegramMemoryDb',
          pool,
          memoryDbStorageConfig(),
        );
      },
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [memoryDbStorageConfig],
      cache: apiConfig().isProduction() === true,
    }),
  ],
  exports: [MemoryDbStorageProvider],
})
export class StorageModule {}
