import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { isInArray } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC,
  GOAL_COMMAND_PRIVATE,
  GOAL_POLL_COMMAND_PRIVATE,
  NATION_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
} from '../commands';
import { TelegramChatTypeEnum } from '../enums/telegram-chat-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_RESTRICT_ADD,
  ON_START_PRIVATE_MESSAGE,
  ON_START_PUBLIC_MESSAGE,
} from '../messages';

export class OnStartHandler {
  /**
   * OnStart event handler
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
      const chat: TelegramBot.Chat = await bot.getChat(
        config.getNotificationChannel(),
      );
      if (msg.chat.type === TelegramChatTypeEnum.PRIVATE) {
        const inlineKeyboard = [
          [
            {
              text: NICKNAME_COMMAND_PRIVATE.BTN,
              callback_data: NICKNAME_COMMAND_PRIVATE.COMMAND,
            },
          ],
          [
            {
              text: NATION_COMMAND_PRIVATE.BTN,
              callback_data: NATION_COMMAND_PRIVATE.COMMAND,
            },
          ],
          [
            {
              text: GOAL_COMMAND_PRIVATE.BTN,
              callback_data: GOAL_COMMAND_PRIVATE.COMMAND,
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
        ];

        if (isInArray(config.getGroupModeratorsIds(), msg.from.id))
          inlineKeyboard.push([
            {
              text: GOAL_POLL_COMMAND_PRIVATE.BTN,
              callback_data: GOAL_POLL_COMMAND_PRIVATE.COMMAND,
            },
          ]);

        await bot.sendMessage(
          msg.chat.id,
          message(ON_START_PRIVATE_MESSAGE, {
            channel: chat.invite_link,
            username: msg.from.first_name,
          }),
          {
            parse_mode: config.getMessageParseMode(),
            reply_markup: {
              resize_keyboard: true,
              force_reply: true,
              inline_keyboard: inlineKeyboard,
            },
          },
        );
      } else {
        if (msg.chat.id !== chat.id) {
          await bot.sendMessage(
            msg.chat.id,
            message(ERROR_RESTRICT_ADD, {
              channelName: chat.title,
              channelLink: chat.invite_link,
            }),
            {
              parse_mode: config.getMessageParseMode(),
            },
          );
        } else {
          await bot.sendMessage(msg.chat.id, message(ON_START_PUBLIC_MESSAGE), {
            parse_mode: config.getMessageParseMode(),
            reply_markup: {
              resize_keyboard: true,
              force_reply: true,
              inline_keyboard: [
                [
                  {
                    text: PLAYERS_LIST_COMMAND_PUBLIC.BTN,
                    callback_data: PLAYERS_LIST_COMMAND_PRIVATE.COMMAND,
                  },
                ],
                [
                  {
                    text: CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.BTN,
                    callback_data:
                      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND,
                  },
                ],
              ],
            },
          });
        }
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
