import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { NICKNAME_COMMAND_PRIVATE } from '../commands';
import {
  ERROR_GAP_MESSAGE,
  ERROR_SET_NICKNAME,
  ON_SET_NICKNAME_MESSAGE,
} from '../messages';

@Injectable()
export class OnSetNicknameHandler {
  /**
   * OnSetNickname event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    logger: Logger,
  ) {
    if (msg.text === NICKNAME_COMMAND_PRIVATE.COMMAND) {
      return bot.sendMessage(
        msg.chat.id,
        message(ERROR_SET_NICKNAME, {
          botId: config.getBotId(),
        }),
        {
          parse_mode: config.getMessageParseMode(),
        },
      );
    }
    void bot
      .sendMessage(msg.chat.id, message(ON_SET_NICKNAME_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      })
      .catch((error) => {
        logger.error(error);
        void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      });
  }
}
