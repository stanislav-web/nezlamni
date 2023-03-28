import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';

@Injectable()
export class OnGetPlayersHandler {
  /**
   * OnGetPlayers event handler
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
    bot.getChat(config.getNotificationChannel()).then((res) => logger.log(res));
    bot
      .getChatAdministrators(config.getNotificationChannel())
      .then((res) => logger.log(res));
    bot
      .getChatMemberCount(config.getNotificationChannel())
      .then((res) => logger.log(res));

    // void bot
    //   .sendMessage(msg.chat.id, message(ON_SET_NICKNAME_MESSAGE), {
    //     parse_mode: config.getMessageParseMode(),
    //   })
    //   .catch((error) => {
    //     logger.error(error);
    //     void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
    //       parse_mode: config.getMessageParseMode(),
    //     });
    //   });
  }
}
