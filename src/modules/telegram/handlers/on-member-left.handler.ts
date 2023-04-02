import { Inject, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, ON_MEMBER_LEFT } from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

export class OnMemberLeftHandler {
  /**
   * @param {PlayerRepository} playerRepository
   * @private
   */
  @Inject(PlayerRepository)
  private static readonly playerRepository: PlayerRepository;

  /**
   * OnMemberLeft event handler
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
      await OnMemberLeftHandler.playerRepository.findOneAndRemove({
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
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
