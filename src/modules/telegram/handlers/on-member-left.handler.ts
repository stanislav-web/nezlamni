import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, ON_MEMBER_LEFT } from '../messages';
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
        await bot.sendMessage(
          msg.chat.id,
          message(ON_MEMBER_LEFT, {
            username: msg.left_chat_member.first_name,
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      }
    } catch (error) {
      logger.error(error);
      if (
        error?.response?.body?.error_code !== 403 &&
        error?.response?.body?.ok !== false
      ) {
        await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      }
    }
  }
}
