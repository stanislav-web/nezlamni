import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  ERROR_GAP_MESSAGE,
  ERROR_RESTRICT_ADD,
  ON_NEW_MEMBER_1,
  ON_NEW_MEMBER_2,
} from '../messages';

@Injectable()
export class OnNewMemberHandler {
  /**
   * OnNewMember event handler
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
    let promise: Promise<TelegramBot.Chat | void | TelegramBot.Message>;
    if (msg.chat.id !== config.getNotificationChannel()) {
      promise = bot.getChat(config.getNotificationChannel()).then((res) => {
        res.invite_link;
        void bot.sendMessage(
          msg.chat.id,
          message(ERROR_RESTRICT_ADD, {
            channelName: res.title,
            channelLink: res.invite_link,
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      });
    } else {
      promise = bot
        .sendMessage(
          msg.chat.id,
          message(ON_NEW_MEMBER_1, {
            adminId: config.getGroupAdminId(),
            adminName: config.getGroupAdminName(),
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        )
        .then(() =>
          bot.sendMessage(msg.chat.id, message(ON_NEW_MEMBER_2), {
            parse_mode: config.getMessageParseMode(),
          }),
        );
    }
    promise.catch((error) => {
      logger.error(error);
      void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    });
  }
}
