import { Logger } from '@nestjs/common';
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';
import {
  arrayBatching,
  findInArrayInsensitive,
  isInArray,
  sortAscBy,
} from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { escapeString, isEmpty } from '../../../common/utils/string.util';
import { GameplayConfigType } from '../../../configs/types/gameplay.config.type';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
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
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_GET_PLAYERS,
  ERROR_START_GOAL_POLL_NO_GOALS,
  ERROR_START_GOAL_POLL_NOT_ENOUGH_GOALS,
  ERROR_UNREGISTERED,
  ON_POLL_START,
  ON_SET_GOAL_MESSAGE,
  ON_SET_NATION_MESSAGE,
  ON_SET_NICKNAME_MESSAGE,
  PLAYERS_LIST_MESSAGE,
} from '../messages';
import { PlayerContentRepository } from '../repositories/player-content.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerContent } from '../schemas/player-content.schema';
import { Player } from '../schemas/player.schema';

export class OnCallbackQueryHandler {
  /**
   * @param {PlayerRepository} playerRepository
   * @private
   */
  private static playerRepository: PlayerRepository;

  /**
   * @param {PlayerContentRepository} playerContentRepository
   * @private
   */
  private static playerContentRepository: PlayerContentRepository;

  /**
   * OnCallbackQuery event handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @param {GameplayConfigType} gameplayConfig
   * @param {PlayerRepository} playerRepository
   * @param {PlayerContentRepository} playerContentRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    gameplayConfig: GameplayConfigType,
    playerRepository: PlayerRepository,
    playerContentRepository: PlayerContentRepository,
    logger: Logger,
  ): Promise<TelegramBot.Message | void> {
    try {
      OnCallbackQueryHandler.playerRepository = playerRepository;
      OnCallbackQueryHandler.playerContentRepository = playerContentRepository;
      const member = await bot.getChatMember(
        config.getNotificationChannel(),
        query.from.id,
      );
      if (!member) {
        const chat: TelegramBot.Chat = await bot.getChat(
          config.getNotificationChannel(),
        );
        return await bot.sendMessage(
          query.from.id,
          message(ERROR_UNREGISTERED, {
            channelName: chat.title,
            channelLink: chat.invite_link,
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      }

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
          await OnCallbackQueryHandler.setGoalQueryHandler(
            bot,
            query,
            config,
            gameplayConfig,
          );
          break;
        case GOAL_POLL_COMMAND_PRIVATE.COMMAND:
          await OnCallbackQueryHandler.startGoalPoll(bot, query, config);
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
   * @param  {TelegramConfigType} config
   * @param  {GameplayConfigType} gameplayConf
   * @return Promise<TelegramBot.Message | void>
   */
  private static setGoalQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
    gameplayConf: GameplayConfigType,
  ): Promise<TelegramBot.Message | void> {
    return bot.sendMessage(
      query.from.id,
      message(ON_SET_GOAL_MESSAGE, {
        exampleLink: `${config.getStaticContentUrl()}/examples/goal.png`,
        limit: gameplayConf.getGameplayGoalsUploadLimit(),
      }),
      {
        parse_mode: config.getMessageParseMode(),
      },
    );
  }

  /**
   * Start goals poll callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param  {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static async startGoalPoll(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    if (isInArray(config.getGroupModeratorsIds(), query.from.id)) {
      const goals: PlayerContent[] =
        await OnCallbackQueryHandler.playerContentRepository.findAll({
          isPolled: false,
          type: PlayerContentTypeEnum.GOAL,
        });
      const count = goals.length;
      if (count <= 0) {
        return await bot.sendMessage(
          query.from.id,
          message(ERROR_START_GOAL_POLL_NO_GOALS),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      }

      const batches = arrayBatching(goals, 10);
      let isPinned = false;
      const answers = [];
      console.log('BATCHES', batches);
      for (let round = 0; round < batches.length; round++) {
        await Promise.all(
          batches[round].map(async (content, index): Promise<void> => {
            const caption = `${++index}. ⚽️ ${content.caption}`;
            const filePath = `${config
              .getStaticContentUrl()
              .replace('data', '')}${content.filePath}`;
            answers.push(caption);
            await bot.sendVideo(query.from.id, filePath, {
              has_spoiler: true,
              caption: caption,
              parse_mode: config.getMessageParseMode(),
            });
          }),
        );
        if (answers.length < 2) {
          return await bot.sendMessage(
            query.from.id, // DONT CHANGE
            message(ERROR_START_GOAL_POLL_NOT_ENOUGH_GOALS),
            {
              parse_mode: config.getMessageParseMode(),
            },
          );
        }
        const poll = await bot.sendPoll(
          query.from.id,
          message(ON_POLL_START, { round }),
          answers,
          {
            is_anonymous: false,
            allows_multiple_answers: false,
            type: 'regular',
            open_period: 60,
            explanation_parse_mode: config.getMessageParseMode(),
          },
        );
        if (!isPinned)
          await bot.pinChatMessage(query.from.id, poll.message_id, {
            disable_notification: false,
          });
        isPinned = true;
      }
    }
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
      const pls = sortAscBy(players, 'telegramFirstName');
      const content = [];
      pls.map((player: Player, i) => {
        let nation = '';
        if ('playerNation' in player) {
          const pNation = player.playerNation || '';
          const country = findInArrayInsensitive(
            countries,
            'code',
            pNation,
          ) as CountryListItemType;
          nation = !isEmpty(country) ? ` ${country?.flag}` : ` ${pNation}`;
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
