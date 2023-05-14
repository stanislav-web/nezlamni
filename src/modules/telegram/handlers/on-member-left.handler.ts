import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { findInArrayInsensitive } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
import {
  ERROR_GAP_MESSAGE,
  ON_MEMBER_LEFT,
  ON_MEMBER_LEFT_NATION_AVAILABLE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

export class OnMemberLeftHandler {
  /**
   * OnMemberLeft event handler
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
  ): Promise<void> {
    try {
      const player = await playerRepository.findOne({
        telegramUserId: msg.left_chat_member.id,
      });
      if (!isEmpty(player)) {
        await playerRepository.findOneAndRemove({
          telegramUserId: msg.left_chat_member.id,
        });

        if (!isEmpty(player?.playerNation)) {
          const country = findInArrayInsensitive(
            countries,
            'code',
            player.playerNation,
          ) as CountryListItemType;
          const nation = !isEmpty(country)
            ? country?.flag
            : player.playerNation;
          await bot.sendMessage(
            msg.chat.id,
            message(ON_MEMBER_LEFT_NATION_AVAILABLE, {
              username: msg.left_chat_member.first_name,
              nation,
            }),
            {
              message_thread_id:
                config.getChatThreadId() || msg?.message_thread_id || undefined,
              parse_mode: config.getMessageParseMode(),
            },
          );
        } else {
          await bot.sendMessage(
            msg.chat.id,
            message(ON_MEMBER_LEFT, {
              username: msg.left_chat_member.first_name,
            }),
            {
              message_thread_id: msg?.message_thread_id || undefined,
              parse_mode: config.getMessageParseMode(),
            },
          );
        }
      }
    } catch (error) {
      logger.error(error);
      if (
        error?.response?.body?.error_code !== 403 &&
        error?.response?.body?.ok !== false
      ) {
        await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          message_thread_id: msg?.message_thread_id || undefined,
          parse_mode: config.getMessageParseMode(),
        });
      }
    }
  }
}
