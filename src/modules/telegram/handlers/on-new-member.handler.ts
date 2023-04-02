import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  ERROR_GAP_MESSAGE,
  ERROR_RESTRICT_ADD,
  ON_NEW_MEMBER,
} from '../messages';

export class OnNewMemberHandler {
  /**
   * OnNewMember event handler
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
      if (msg.chat.id !== chat.id) {
        await bot.sendMessage(
          msg.chat.id,
          message(ERROR_RESTRICT_ADD, {
            channelName: chat.title,
            channelLink: chat.invite_link,
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        await bot.sendMessage(
          msg.chat.id,
          message(ON_NEW_MEMBER, {
            username: msg.new_chat_members[0].first_name,
            adminName: config.getGroupAdminName(),
            botId: config.getBotId(),
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
