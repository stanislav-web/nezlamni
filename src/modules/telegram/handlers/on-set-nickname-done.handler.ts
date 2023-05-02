import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  ERROR_EMPTY,
  ERROR_GAP_MESSAGE,
  ERROR_UNREGISTERED,
  ON_SET_NICKNAME_DONE_MESSAGE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

export class OnSetNicknameDoneHandler {
  /**
   * OnSetNicknameDone event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    logger: Logger,
  ): Promise<TelegramBot.Message | void> {
    try {
      const member = await bot.getChatMember(
        config.getNotificationChannel(),
        msg.from.id,
      );
      if (!member) {
        const chat: TelegramBot.Chat = await bot.getChat(
          config.getNotificationChannel(),
        );
        return await bot.sendMessage(
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
      }
      if (!('text' in msg)) {
        await bot.sendMessage(msg.chat.id, message(ERROR_EMPTY), {
          message_thread_id: msg?.message_thread_id || undefined,
          parse_mode: config.getMessageParseMode(),
        });
      } else {
        const text = msg.text.trim();
        const player = await playerRepository.findOneAndUpdate(
          {
            telegramUserId: msg.from.id,
          },
          {
            telegramChannelId: config.getNotificationChannel(),
            playerNickname: msg.text,
            telegramFirstName: msg.from.first_name,
          },
        );
        if (isEmpty(player))
          await playerRepository.create({
            telegramChannelId: config.getNotificationChannel(),
            telegramUserId: msg.from.id,
            telegramFirstName: msg.from.first_name.trim(),
            telegramUsername: msg.from?.username || '-',
            playerNickname: text,
          });
        await bot.sendMessage(
          msg.chat.id,
          message(ON_SET_NICKNAME_DONE_MESSAGE, {
            username: msg.from.first_name,
          }),
          {
            message_thread_id: msg?.message_thread_id || undefined,
            parse_mode: config.getMessageParseMode(),
          },
        );
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
