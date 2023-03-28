import { registerAs } from '@nestjs/config';
import { ParseMode } from 'node-telegram-bot-api';
import { TelegramConfigType } from './types/telegram.config.type';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'telegram',
  (): TelegramConfigType => ({
    /**
     * Get web hook domain
     * @return string
     */
    getWebHookDomain: (): string => getEnv('TELEGRAM_WEBHOOK_DOMAIN', true),
    /**
     * Get web hook port
     * @return number
     */
    getWebHookPort: (): number =>
      parseInt(getEnv('TELEGRAM_WEBHOOK_PORT', true)),
    /**
     * Get Telegram channel for notifications
     * @return {number}
     */
    getNotificationChannel: (): number =>
      parseInt(getEnv('TELEGRAM_NOTIFICATIONS_CHANNEL', true)),
    /**
     * Get api pooling timeout (ms)
     * @return {number}
     */
    getPoolingTimeout: (): number =>
      parseInt(getEnv('TELEGRAM_POOLING_TIMEOUT', true)),
    /**
     * Get Telegram token
     * @return {string}
     */
    getToken: (): string => getEnv('TELEGRAM_TOKEN', true),

    /**
     * Get maximum allowed connections
     * @return number
     */
    getMaxAllowedConnections: (): number =>
      parseInt(getEnv('TELEGRAM_MAX_ALLOWED_CONNECTIONS', true)),

    /**
     * Get telegram bot name
     * @return string
     */
    getBotName: (): string => getEnv('TELEGRAM_BOT_NAME', true),

    /**
     * Get pooling interval (sec)
     * @return {number}
     */
    getPoolingInterval: (): number =>
      parseInt(getEnv('TELEGRAM_POOLING_INTERVAL', true)),

    /**
     * Is pooling enabled ? Instead webhooks
     * @return {boolean}
     */
    isPooling: (): boolean => getEnv('TELEGRAM_POOLING', true) === 'true',

    /**
     * Is pooling started automatically?
     * @return {boolean}
     */
    isPoolingAutoStart: (): boolean =>
      getEnv('TELEGRAM_POOLING_AUTOSTART', true) === 'true',

    /**
     * Get messages parse mode
     * @return {ParseMode}
     */
    getMessageParseMode: (): ParseMode =>
      getEnv('TELEGRAM_MESSAGE_PARSE_MODE', true) as ParseMode,

    /**
     * Get group admin id
     * @return {number}
     */
    getGroupAdminId: (): number =>
      parseInt(getEnv('TELEGRAM_GROUP_ADMIN_ID', true)),
    /**
     * Get group admin id
     * @return {string}
     */
    getGroupAdminName: (): string => getEnv('TELEGRAM_GROUP_ADMIN_NAME', true),
  }),
);
