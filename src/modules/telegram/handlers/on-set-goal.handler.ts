import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { GameplayConfigType } from '../../../configs/types/gameplay.config.type';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { TelegramChatTypeEnum } from '../enums/telegram-chat-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_SET_GOAL_RESTRICT,
  ON_SET_GOAL_MESSAGE,
} from '../messages';

export class OnSetGoalHandler {
  /**
   * OnSetGoal event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {GameplayConfigType} gameplayConf
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    gameplayConf: GameplayConfigType,
    logger: Logger,
  ): Promise<void> {
    try {
      if (msg.chat.type !== TelegramChatTypeEnum.PRIVATE) {
        await bot.sendMessage(
          msg.chat.id,
          message(ERROR_SET_GOAL_RESTRICT, {
            botId: config.getBotId(),
          }),
          {
            message_thread_id: msg?.message_thread_id || undefined,
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        await bot.sendMessage(
          msg.chat.id,
          message(ON_SET_GOAL_MESSAGE, {
            exampleLink: `${config.getStaticContentUrl()}/examples/goal.png`,
            limit: gameplayConf.getGameplayGoalsUploadLimit(),
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
