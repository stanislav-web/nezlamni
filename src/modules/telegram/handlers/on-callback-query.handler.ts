import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';
import { sortAscBy } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { escapeString } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC,
  NICKNAME_COMMAND_PUBLIC,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
} from '../commands';
import {
  ERROR_GAP_MESSAGE,
  ON_SET_NICKNAME_MESSAGE,
  PLAYERS_LIST_MESSAGE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

@Injectable()
export class OnCallbackQueryHandler {
  /**
   * OnCallbackQuery event handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    logger: Logger,
  ) {
    if (query.from.id !== query.message.chat.id) {
      return void bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
    let promise;
    switch (query.data) {
      case NICKNAME_COMMAND_PUBLIC.COMMAND:
        promise = OnCallbackQueryHandler.setNicknameQueryHandler(
          bot,
          query,
          config,
        );
        break;
      case PLAYERS_LIST_COMMAND_PRIVATE.COMMAND ||
        PLAYERS_LIST_COMMAND_PUBLIC.COMMAND:
        promise = OnCallbackQueryHandler.getPlayersListQueryHandler(
          bot,
          query,
          config,
          playerRepository,
        );
        break;
      case CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND ||
        CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.COMMAND:
        promise = OnCallbackQueryHandler.getChannelGamesScheduleQueryHandler(
          bot,
          query,
          config,
        );
        break;
      default:
        break;
    }
    promise.catch((error) => {
      logger.error(error);
      void bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    });
  }

  /**
   * Set nickname callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static setNicknameQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    return bot.sendMessage(query.from.id, message(ON_SET_NICKNAME_MESSAGE), {
      parse_mode: config.getMessageParseMode(),
    });
  }

  /**
   * Get players list callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @return Promise<TelegramBot.Message | void>
   */
  private static getPlayersListQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
  ): Promise<TelegramBot.Message | void> {
    return playerRepository.findAll().then((players: Player[]) => {
      const pls: Player[] = sortAscBy(players, 'telegramFirstName');
      const content = [];
      pls.map((player, i) => {
        content.push([
          `${++i}.`,
          ` [${player.telegramFirstName}](tg://user?id=${player.telegramUserId})`,
          ` (${escapeString(player.playerNickname)})`,
        ]);
      });
      void bot.sendMessage(
        query.from.id,
        message(PLAYERS_LIST_MESSAGE, {
          players: table(content, {
            border: getBorderCharacters('void'),
            columnDefault: {
              paddingLeft: 0,
              paddingRight: 1,
            },
            drawHorizontalLine: () => false,
          }),
        }),
        {
          parse_mode: config.getMessageParseMode(),
        },
      );
    });
  }

  /**
   * Set channel games schedule callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static getChannelGamesScheduleQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    return bot.sendMessage(
      query.from.id,
      message(`${config.getChannelGamesScheduleLink()}`),
      {
        parse_mode: config.getMessageParseMode(),
      },
    );
  }
}
