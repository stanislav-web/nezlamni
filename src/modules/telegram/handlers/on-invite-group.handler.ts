import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, ON_INVITE_GROUP_MESSAGE } from '../messages';

export class OnInviteGroupHandler {
  /**
   * OnInviteGroupHandler event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    logger: Logger,
  ): Promise<void> {
    try {
      const chat: TelegramBot.Chat = await bot.getChat(
        config.getNotificationChannel(),
      );

      await bot.sendMessage(
        msg.chat.id,
        message(ON_INVITE_GROUP_MESSAGE, {
          channelLink: chat.invite_link,
        }),
        {
          message_thread_id: msg?.message_thread_id || undefined,
          parse_mode: config.getMessageParseMode(),
        },
      );
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        message_thread_id: msg?.message_thread_id || undefined,
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
