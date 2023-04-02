import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, ON_SET_NICKNAME_DONE_MESSAGE } from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

export class OnSetNicknameDoneHandler {
  /**
   * @param {PlayerRepository} playerRepository
   * @private
   */
  private static playerRepository: PlayerRepository;

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
  ): Promise<void> {
    try {
      OnSetNicknameDoneHandler.playerRepository = playerRepository;
      const text = msg.text.trim();
      const player =
        await OnSetNicknameDoneHandler.playerRepository.findOneAndUpdate(
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
        await OnSetNicknameDoneHandler.playerRepository.create({
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
