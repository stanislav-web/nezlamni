import { ParseMode } from 'node-telegram-bot-api';

export type TelegramConfigType = {
  /**
   * Get bot name
   * @return string
   */
  getBotName(): string;
  /**
   * Get group admin id
   * @return {number}
   */
  getGroupAdminId(): number;
  /**
   * Get group admin id
   * @return {string}
   */
  getGroupAdminName(): string;

  /**
   * Get maximum allowed connections
   * @return number
   */
  getMaxAllowedConnections(): number;

  /**
   * Get messages parse mode
   * @return {ParseMode}
   */
  getMessageParseMode(): ParseMode;
  /**
   * Get Telegram channel for notifications
   * @return {string}
   */
  getNotificationChannel(): string;

  /**
   * Get pooling interval (sec)
   * @return {number}
   */
  getPoolingInterval(): number;

  /**
   * Get api pooling timeout
   * @return {number}
   */
  getPoolingTimeout(): number;

  /**
   * Get Telegram token
   * @return {string}
   */
  getToken(): string;

  /**
   * Get web hook domain
   * @return string
   */
  getWebHookDomain(): string;

  /**
   * Get web hook port
   * @return number
   */
  getWebHookPort(): number;

  /**
   * Is pooling enabled ? Instead webhooks
   * @return {boolean}
   */
  isPooling(): boolean;

  /**
   * Is pooling started automatically?
   * @return {boolean}
   */
  isPoolingAutoStart(): boolean;
};
