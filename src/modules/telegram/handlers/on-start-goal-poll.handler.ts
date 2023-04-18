import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { arrayBatching } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_START_GOAL_POLL_NO_GOALS,
  ON_POLL_START,
} from '../messages';
import { PlayerContentRepository } from '../repositories/player-content.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerContent } from '../schemas/player-content.schema';

export class OnStartGoalPollHandler {
  /**
   * OnStartGoalPoll event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {PlayerRepository} playerRepository
   * @param {PlayerContentRepository} playerContentRepository
   * @param {TelegramConfigType} config
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    playerRepository: PlayerRepository,
    playerContentRepository: PlayerContentRepository,
    config: TelegramConfigType,
    logger: Logger,
  ): Promise<TelegramBot.Message | void> {
    try {
      const goals: PlayerContent[] = await playerContentRepository.findAll({
        isPolled: false,
        type: PlayerContentTypeEnum.GOAL,
      });
      const count = goals.length;
      if (count <= 0) {
        return await bot.sendMessage(
          msg.chat.id,
          message(ERROR_START_GOAL_POLL_NO_GOALS),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      }

      const batches = arrayBatching(goals, 10);
      let isPinned = false;
      const answers = [];
      for (let round = 0; round < batches.length; round++) {
        await Promise.all(
          batches[round].map(async (content, index): Promise<void> => {
            const caption = `${++index}. ⚽️ ${content.caption}`;
            answers.push(caption);
            await bot.sendVideo(msg.chat.id, content.filePath, {
              has_spoiler: true,
              caption: caption,
              parse_mode: config.getMessageParseMode(),
            });
          }),
        );

        const poll = await bot.sendPoll(
          msg.chat.id,
          message(ON_POLL_START, { round }),
          answers,
          {
            is_anonymous: false,
            allows_multiple_answers: false,
            type: 'regular',
            open_period: 60,
            explanation_parse_mode: config.getMessageParseMode(),
          },
        );
        if (!isPinned)
          await bot.pinChatMessage(msg.chat.id, poll.message_id, {
            disable_notification: false,
          });
        isPinned = true;
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
