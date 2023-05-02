import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { TelegramChatTypeEnum } from '../enums/telegram-chat-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_SET_NICKNAME,
  ERROR_UNREGISTERED,
  ON_SET_NICKNAME_MESSAGE,
} from '../messages';

@Injectable()
export class OnSetNicknameHandler {
  /**
   * OnSetNickname event handler
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
      if (msg.chat.type !== TelegramChatTypeEnum.PRIVATE) {
        await bot.sendMessage(
          msg.chat.id,
          message(ERROR_SET_NICKNAME, {
            botId: config.getBotId(),
          }),
          {
            message_thread_id: msg?.message_thread_id || undefined,
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        const member = await bot.getChatMember(
          config.getNotificationChannel(),
          msg.from.id,
        );
        if (!member) {
          const chat: TelegramBot.Chat = await bot.getChat(
            config.getNotificationChannel(),
          );
          await bot.sendMessage(
            msg.chat.id,
            message(ERROR_UNREGISTERED, {
              channelName: chat.title,
              channelLink: chat.invite_link,
            }),
            {
              message_thread_id: msg?.message_thread_id || undefined,
              parse_mode: config.getMessageParseMode(),
            },
          );
        } else
          await bot.sendMessage(msg.chat.id, message(ON_SET_NICKNAME_MESSAGE), {
            message_thread_id: msg?.message_thread_id || undefined,
            parse_mode: config.getMessageParseMode(),
          });
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        message_thread_id: msg?.message_thread_id || undefined,
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
