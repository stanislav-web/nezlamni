import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { TelegramChatTypeEnum } from '../enums/telegram-chat-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_SET_NATION_RESTRICT,
  ON_SET_NATION_MESSAGE,
} from '../messages';

export class OnSetNationHandler {
  /**
   * OnSetNation event handler
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
          message(ERROR_SET_NATION_RESTRICT, {
            botId: config.getBotId(),
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        await bot.sendMessage(msg.chat.id, message(ON_SET_NATION_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
