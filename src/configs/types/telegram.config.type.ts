import { ParseMode } from 'node-telegram-bot-api';

export type TelegramConfigType = {
  /**
   * Get bot id
   * @return {number}
   */
  getBotId(): number;
  /**
   * Get bot name
   * @return string
   */
  getBotName(): string;
  /**
   * Get channel games champions link
   * @return {string}
   */
  getChannelGamesChampionsLink(): string;

  /**
   * Get telegram chat thread Id
   * @return {number| undefined}
   */
  getChatThreadId(): number | undefined;

  /**
   * Get telegram goals thread Id
   * @return {number | undefined}
   */
  getGoalsThreadId(): number | undefined;

  /**
   * Get group admin id
   * @return {number}
   */
  getGroupAdminId(): number;

  /**
   * Get group admin name
   * @return {string}
   */
  getGroupAdminName(): string;
  /**
   * Get group moderators ids
   * @return string[]
   */
  getGroupModeratorsIds(): string[];

  /**
   * Get telegram main thread Id
   * @return {number | undefined}
   */
  getMainThreadId(): number | undefined;

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
   * @return {number}
   */
  getNotificationChannel(): number;

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
   * Get static content url
   * @return {string}
   */
  getStaticContentUrl(): string;

  /**
   * Get Telegram token
   * @return {string}
   */
  getToken(): string;

  /**
   * Get upload files path content url
   * @return {string}
   */
  getUploadFilesPath(): string;

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
