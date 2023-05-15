import { Logger } from '@nestjs/common';
import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';
import {
  arrayBatching,
  findInArrayInsensitive,
  groupBy,
  isInArray,
  sortAscBy,
} from '../../../common/utils/array.util';
import { getRandomNumber } from '../../../common/utils/number.util';
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
  INVITE_GROUP_PRIVATE,
  INVITE_GROUP_PUBLIC,
  NATION_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
  RULES_GROUP_PRIVATE,
  RULES_GROUP_PUBLIC,
} from '../commands';
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';
import {
  ERROR_GAP_MESSAGE,
  ERROR_GET_PLAYERS,
  ERROR_PERMISSIONS,
  ERROR_START_GOAL_POLL_NO_GOALS,
  ERROR_START_GOAL_POLL_NOT_ENOUGH_GOALS,
  ERROR_UNREGISTERED,
  ON_GET_RULES_MESSAGE,
  ON_INVITE_GROUP_MESSAGE,
  ON_POLL_FOR_GOAL_PREVIEW,
  ON_POLL_FOR_GOAL_START,
  ON_SET_GOAL_MESSAGE,
  ON_SET_NATION_MESSAGE,
  ON_SET_NICKNAME_MESSAGE,
  PLAYERS_LIST_MESSAGE,
} from '../messages';
import { ERROR_CONTINUE_GOAL_POLL_NOT_ENOUGH_GOALS } from '../messages/errors.message';
import { PlayerContentRepository } from '../repositories/player-content.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerContent } from '../schemas/player-content.schema';
import { Player } from '../schemas/player.schema';
import { GOAL_POLL_ONE_ROUND_TPL } from '../templates/poll.template';
import { PollType } from '../types/poll.type';
import { SortedPollType } from '../types/sorted-poll.type';

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
            message_thread_id: query.message?.message_thread_id || undefined,
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

        case INVITE_GROUP_PRIVATE.COMMAND || INVITE_GROUP_PUBLIC.COMMAND:
          await OnCallbackQueryHandler.getInviteMessageQueryHandler(
            bot,
            query,
            config,
          );
          break;

        case RULES_GROUP_PRIVATE.COMMAND || RULES_GROUP_PUBLIC.COMMAND:
          await OnCallbackQueryHandler.getRulesQueryHandler(bot, query, config);
          break;

        default:
          break;
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(query.from.id, message(ERROR_GAP_MESSAGE), {
        parse_mode: config.getMessageParseMode(),
        message_thread_id: query.message?.message_thread_id || undefined,
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
      message_thread_id: query.message?.message_thread_id || undefined,
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
      message_thread_id: query.message?.message_thread_id || undefined,
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
        message_thread_id: query.message?.message_thread_id || undefined,
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
    // Check permissions
    if (false === isInArray(config.getGroupModeratorsIds(), query.from.id)) {
      return await bot.sendMessage(query.from.id, message(ERROR_PERMISSIONS), {
        parse_mode: config.getMessageParseMode(),
        message_thread_id: query?.message.message_thread_id || undefined,
      });
    }
    const chat: TelegramBot.Chat = await bot.getChat(
      config.getNotificationChannel(),
    );
    const channelId = chat.id;
    const channelThreadId = config.getGoalsThreadId();

    // Retrieve goals for poll
    const goals: PlayerContent[] =
      await OnCallbackQueryHandler.playerContentRepository.findAll({
        isPolled: false,
        type: PlayerContentTypeEnum.GOAL,
      });
    // Check goals for available for poll
    if (goals.length <= 0) {
      return await bot.sendMessage(
        query.from.id,
        message(ERROR_START_GOAL_POLL_NO_GOALS),
        {
          parse_mode: config.getMessageParseMode(),
          message_thread_id: query.message?.message_thread_id || undefined,
        },
      );
    }

    const pools = [] as PollType[];
    const batches = arrayBatching(goals, 10);
    // Loop through batches with goals
    batches.map((batchesItems, round) => {
      const pollRound = ++round;
      batchesItems.map((content, index) => {
        pools.push({
          round: pollRound,
          contentId: content._id.toString(),
          caption: `${++index}. ⚽️ ${content.caption}`,
          file: `${config.getStaticContentUrl().replace('data', '')}${
            content.filePath
          }?random=${getRandomNumber(1, 150)}`,
        });
      });
    });

    if (pools.length < 2) {
      return await bot.sendMessage(
        query.from.id,
        message(ERROR_START_GOAL_POLL_NOT_ENOUGH_GOALS),
        {
          message_thread_id: query.message?.message_thread_id || undefined,
          parse_mode: config.getMessageParseMode(),
        },
      );
    }

    const startPollMsg = await bot.sendMessage(
      channelId,
      message(ON_POLL_FOR_GOAL_PREVIEW),
      {
        protect_content: true,
        message_thread_id: channelThreadId,
        parse_mode: config.getMessageParseMode(),
      },
    );
    await bot.pinChatMessage(channelId, startPollMsg.message_id, {
      disable_notification: false,
    });

    const content: SortedPollType = groupBy<PollType>(pools, 'round');
    for (const round in content) {
      const options = content[round].map((item) => item.caption);
      const contentIds = content[round].map((item) => item.contentId);
      if (options.length < 2) {
        return await bot.sendMessage(
          channelId,
          message(ERROR_CONTINUE_GOAL_POLL_NOT_ENOUGH_GOALS, {
            round,
          }),
          {
            message_thread_id: channelThreadId,
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        try {
          await content[round].reduce(async (p, content: PollType) => {
            await bot.sendVideo(channelId, content.file, {
              has_spoiler: true,
              caption: content.caption,
              message_thread_id: channelThreadId,
              parse_mode: config.getMessageParseMode(),
            });
          }, Promise.resolve());
        } catch (e) {
          // eslint-disable-next-line no-console
          //@TODO
          console.error({ channelId, content, error: e });
        }
      }
      const result = await bot.sendPoll(
        channelId,
        message(ON_POLL_FOR_GOAL_START, {
          round:
            Object.keys(content).length > 1
              ? `${round} тур`
              : GOAL_POLL_ONE_ROUND_TPL,
        }),
        options,
        {
          is_anonymous: false,
          message_thread_id: channelThreadId,
          allows_multiple_answers: false,
          protect_content: true,
        },
      );

      await OnCallbackQueryHandler.playerContentRepository.updateManyByIds(
        contentIds,
        {
          pollId: result.poll.id,
          isPolled: true,
        },
      );
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
        message_thread_id: query.message?.message_thread_id || undefined,
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
          message_thread_id: query.message?.message_thread_id || undefined,
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
      message(
        `${config.getStaticContentUrl()}/examples/schedule.png?r=${getRandomNumber(
          1,
          100,
        )}`,
      ),
      {
        message_thread_id: query.message?.message_thread_id || undefined,
        parse_mode: config.getMessageParseMode(),
      },
    );
  }

  /**
   * Get rules callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static async getRulesQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    await bot.sendMessage(query.from.id, message(ON_GET_RULES_MESSAGE), {
      message_thread_id: query.message?.message_thread_id || undefined,
      parse_mode: config.getMessageParseMode(),
    });
  }

  /**
   * Get rules callback query handler
   * @param {TelegramBot} bot
   * @param {CallbackQuery} query
   * @param {TelegramConfigType} config
   * @return Promise<TelegramBot.Message | void>
   */
  private static async getInviteMessageQueryHandler(
    bot: TelegramBot,
    query: CallbackQuery,
    config: TelegramConfigType,
  ): Promise<TelegramBot.Message | void> {
    const chat: TelegramBot.Chat = await bot.getChat(
      config.getNotificationChannel(),
    );

    await bot.sendMessage(
      query.from.id,
      message(ON_INVITE_GROUP_MESSAGE, {
        channelLink: chat.invite_link,
      }),
      {
        message_thread_id: query.message?.message_thread_id || undefined,
        parse_mode: config.getMessageParseMode(),
      },
    );
  }
}
