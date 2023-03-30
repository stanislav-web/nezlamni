import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PUBLIC,
  PLAYERS_LIST_COMMAND_PRIVATE,
} from '../commands';
import {
  ERROR_GAP_MESSAGE,
  ON_START_MESSAGE,
  ON_START_STANDALONE_MESSAGE,
} from '../messages';

@Injectable()
export class OnStartHandler {
  /**
   * OnStart event handler
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
    let notification;
    const chain: Promise<TelegramBot.Chat> = bot.getChat(
      config.getNotificationChannel(),
    );

    if (msg.chat.type !== 'private') {
      notification = () => ({
        text: ON_START_MESSAGE,
        data: {
          username: msg.from.first_name,
        },
      });
    } else {
      notification = (channel) => ({
        text: ON_START_STANDALONE_MESSAGE,
        data: {
          channel: channel.invite_link,
          username: msg.from.first_name,
        },
      });
    }
    chain
      .then((channel) => {
        void bot.sendMessage(
          msg.chat.id,
          message(notification(channel).text, notification(channel).data),
          {
            parse_mode: config.getMessageParseMode(),
            reply_markup: {
              resize_keyboard: true,
              force_reply: true,
              inline_keyboard: [
                [
                  {
                    text: NICKNAME_COMMAND_PUBLIC.BTN,
                    callback_data: NICKNAME_COMMAND_PUBLIC.COMMAND,
                  },
                ],
                [
                  {
                    text: PLAYERS_LIST_COMMAND_PRIVATE.BTN,
                    callback_data: PLAYERS_LIST_COMMAND_PRIVATE.COMMAND,
                  },
                ],
                [
                  {
                    text: CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.BTN,
                    callback_data:
                      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND,
                  },
                ],
              ],
            },
          },
        );
      })
      .catch((error) => {
        logger.error(error);
        void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      });
  }
}
