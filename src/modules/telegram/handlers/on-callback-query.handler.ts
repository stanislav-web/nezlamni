import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { NICKNAME_COMMAND, PLAYERS_LIST_COMMAND } from '../commands';
import { ERROR_GAP_MESSAGE, ON_SET_NICKNAME_MESSAGE } from '../messages';

@Injectable()
export class OnCallbackQueryHandler {
  /**
   * OnCallbackQuery event handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    logger: Logger,
  ) {
    switch (query.data) {
      case NICKNAME_COMMAND.COMMAND:
        void bot
          .sendMessage(query.from.id, message(ON_SET_NICKNAME_MESSAGE), {
            parse_mode: config.getMessageParseMode(),
          })
          .catch((error) => {
            logger.error(error);
            void bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
              parse_mode: config.getMessageParseMode(),
            });
          });
        break;
      case PLAYERS_LIST_COMMAND.COMMAND:
        void bot
          .sendMessage(query.from.id, message(ON_SET_NICKNAME_MESSAGE), {
            parse_mode: config.getMessageParseMode(),
          })
          .catch((error) => {
            logger.error(error);
            void bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
              parse_mode: config.getMessageParseMode(),
            });
          });
        break;
      default:
    }
  }
}
