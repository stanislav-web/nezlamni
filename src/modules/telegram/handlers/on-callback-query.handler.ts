import { Logger } from '@nestjs/common';
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';
import {
  findInArrayInsensitive,
  sortAscStringBy,
} from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { escapeString, isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
import {
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC,
  GOAL_COMMAND_PRIVATE,
  NATION_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
} from '../commands';
import {
  ERROR_GAP_MESSAGE,
  ERROR_GET_PLAYERS,
  ON_SET_GOAL_MESSAGE,
  ON_SET_NATION_MESSAGE,
  ON_SET_NICKNAME_MESSAGE,
  PLAYERS_LIST_MESSAGE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

export class OnCallbackQueryHandler {
  /**
   * @param {PlayerRepository} playerRepository
   * @private
   */
  private static playerRepository: PlayerRepository;

  /**
   * OnCallbackQuery event handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    logger: Logger,
  ): Promise<void> {
    try {
      OnCallbackQueryHandler.playerRepository = playerRepository;
      switch (query.data) {
        case NICKNAME_COMMAND_PRIVATE.COMMAND:
          await OnCallbackQueryHandler.setNicknameQueryHandler(
            bot,
            query,
            config,
          );
          break;
        case NATION_COMMAND_PRIVATE.COMMAND:
          await OnCallbackQueryHandler.setNationQueryHandler(
            bot,
            query,
            config,
          );
          break;
        case GOAL_COMMAND_PRIVATE.COMMAND:
          await OnCallbackQueryHandler.setGoalQueryHandler(bot, query, config);
          break;
        case PLAYERS_LIST_COMMAND_PRIVATE.COMMAND ||
          PLAYERS_LIST_COMMAND_PUBLIC.COMMAND:
          await OnCallbackQueryHandler.getPlayersListQueryHandler(
            bot,
            query,
            config,
          );
          break;
        case CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND ||
          CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.COMMAND:
          await OnCallbackQueryHandler.getChannelGamesScheduleQueryHandler(
            bot,
            query,
            config,
          );
          break;
        default:
          break;
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
      });
    }
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
   * Set nation callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param  {TelegramConfigType} config,
   * @return Promise<TelegramBot.Message | void>
   */
  private static setNationQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    return bot.sendMessage(query.from.id, message(ON_SET_NATION_MESSAGE), {
      parse_mode: config.getMessageParseMode(),
    });
  }

  /**
   * Set goal callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param  {TelegramConfigType} config,
   * @return Promise<TelegramBot.Message | void>
   */
  private static setGoalQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    return bot.sendMessage(
      query.from.id,
      message(ON_SET_GOAL_MESSAGE, {
        exampleLink: `${config.getStaticContentUrl()}/examples/goal.png`,
      }),
      {
        parse_mode: config.getMessageParseMode(),
      },
    );
  }

  /**
   * Get players list callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static async getPlayersListQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    const players: Player[] =
      await OnCallbackQueryHandler.playerRepository.findAll();
    if (!players)
      await bot.sendMessage(query.from.id, message(ERROR_GET_PLAYERS), {
        parse_mode: config.getMessageParseMode(),
      });
    else {
      const pls = sortAscStringBy(players, 'telegramFirstName');
      const content = [];
      pls.map((player: Player, i) => {
        let nation = '';
        if ('playerNation' in player) {
          const country = findInArrayInsensitive(
            countries,
            'code',
            player.playerNation || '',
          ) as CountryListItemType;
          nation = !isEmpty(country)
            ? ` ${country?.flag}`
            : ` ${player?.playerNation}` || ('' as string);
        }
        content.push([
          `${++i}.`,
          ` [${player.telegramFirstName}](tg://user?id=${player.telegramUserId})`,
          ` (${escapeString(player.playerNickname)}${nation})`,
        ]);
      });
      await bot.sendMessage(
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
    }
  }

  /**
   * Get channel games schedule callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static async getChannelGamesScheduleQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    await bot.sendMessage(
      query.from.id,
      message(`${config.getChannelGamesScheduleLink()}`),
      {
        parse_mode: config.getMessageParseMode(),
      },
    );
  }
}
