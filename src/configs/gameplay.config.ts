import { registerAs } from '@nestjs/config';
import { GameplayConfigType } from './types/gameplay.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'gameplay',
  (): GameplayConfigType => ({
    /**
     * Get gameplay goals upload limit
     * @return number
     */
    getGameplayGoalsUploadLimit: (): number =>
      parseInt(getEnv('GAMEPLAY_GOALS_UPLOAD_LIMIT', true)),
  }),
);
