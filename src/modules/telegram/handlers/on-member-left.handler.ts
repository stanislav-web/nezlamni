import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  ERROR_GAP_MESSAGE,
  ON_MEMBER_LEFT,
  ON_NEW_MEMBER_2,
} from '../messages';

@Injectable()
export class OnMemberLeftHandler {
  /**
   * OnMemberLeft event handler
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
    void bot
      .sendMessage(
        msg.chat.id,
        message(ON_MEMBER_LEFT, {
          username: msg.left_chat_member.first_name,
        }),
        {
          parse_mode: config.getMessageParseMode(),
        },
      )
      .then(() =>
        bot.sendMessage(msg.chat.id, message(ON_NEW_MEMBER_2), {
          parse_mode: config.getMessageParseMode(),
        }),
      )
      .catch((error) => {
        logger.error(error);
        void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      });
  }
}
