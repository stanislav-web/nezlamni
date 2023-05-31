import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { isInArray } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  ERROR_EMPTY,
  ERROR_GAP_MESSAGE,
  ERROR_PERMISSIONS,
  PLAYER_REMOVED,
  REMOVE_PLAYER_NOT_FOUND,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

export class OnRemovePlayerDoneHandler {
  /**
   * Check user permission
   * @param {TelegramBot} bot
   * @param {TelegramConfigType} config
   * @param {Message} msg
   * @private
   */
  private static async checkPermission(
    bot: TelegramBot,
    config: TelegramConfigType,
    msg: Message,
  ) {
    if (false === isInArray(config.getGroupModeratorsIds(), msg.from.id)) {
      return await bot.sendMessage(msg.from.id, message(ERROR_PERMISSIONS), {
        parse_mode: config.getMessageParseMode(),
        message_thread_id: msg?.message_thread_id || undefined,
      });
    }
  }
  /**
   * OnRemovePlayerDone event handler
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
      await OnRemovePlayerDoneHandler.checkPermission(bot, config, msg);
      if (!('text' in msg)) {
        await bot.sendMessage(msg.chat.id, message(ERROR_EMPTY), {
          message_thread_id: msg?.message_thread_id || undefined,
          parse_mode: config.getMessageParseMode(),
        });
      } else {
        const text = msg.text.trim();
        const player = await playerRepository.findOne({
          playerNickname: text,
        });
        const playerRemoved = await playerRepository.findOneAndRemove({
          playerNickname: text,
        });
        if (isEmpty(playerRemoved)) {
          return await bot.sendMessage(
            msg.chat.id,
            message(REMOVE_PLAYER_NOT_FOUND, { playerNickname: text }),
            {
              message_thread_id: msg?.message_thread_id || undefined,
              parse_mode: config.getMessageParseMode(),
            },
          );
        }
        try {
          await bot.sendMessage(
            msg.chat.id,
            message(PLAYER_REMOVED, {
              telegramFirstName: player.telegramFirstName,
              playerNickname: player.playerNickname,
            }),
            {
              message_thread_id: msg?.message_thread_id || undefined,
              parse_mode: config.getMessageParseMode(),
            },
          );
          const member = await bot.getChatMember(
            config.getNotificationChannel(),
            player.telegramUserId,
          );
          if (member)
            await bot.banChatMember(
              config.getNotificationChannel(),
              member.user.id,
            );
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('ERROR REMOVED', e);
        }
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
