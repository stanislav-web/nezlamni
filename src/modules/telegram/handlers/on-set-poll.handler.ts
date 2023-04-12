import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';
import { ERROR_GAP_MESSAGE } from '../messages';
import { ON_POLL } from '../messages/on-poll.message';
import { PlayerContentRepository } from '../repositories/player-content.repository';

export class OnSetPollHandler {
  /**
   * @param {PlayerContentRepository} playerContentRepository
   * @private
   */
  private static playerContentRepository: PlayerContentRepository;

  /**
   * OnSetPoll event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {PlayerContentRepository} playerContentRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    playerContentRepository: PlayerContentRepository,
    logger: Logger,
  ): Promise<void> {
    try {
      OnSetPollHandler.playerContentRepository = playerContentRepository;
      const content = await OnSetPollHandler.playerContentRepository.findAll(
        {
          type: PlayerContentTypeEnum.GOAL,
        },
        10,
      );
      const answers = content.map(
        ({ caption }, index) => `${++index}). ⚽️ ${caption}`,
      );
      const message = await bot.sendPoll(
        config.getNotificationChannel(),
        ON_POLL,
        answers,
        {
          is_anonymous: false,
          allows_multiple_answers: false,
          type: 'regular',
          open_period: 60, //sec
          explanation_parse_mode: config.getMessageParseMode(),
        },
      );
      await bot.pinChatMessage(
        config.getNotificationChannel(),
        message.message_id,
        {
          disable_notification: false,
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
