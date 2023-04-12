import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import TelegramBot, { CallbackQuery, Message } from 'node-telegram-bot-api';
import { isEmpty } from '../../../common/utils/string.util';
import { gameplayConfig, telegramConfig } from '../../../configs';
import { MemoryDbStorageProvider } from '../../storage/providers/memory-db.provider';
import {
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC,
  GOAL_COMMAND_PRIVATE,
  GOAL_COMMAND_PUBLIC,
  NATION_COMMAND_PRIVATE,
  NATION_COMMAND_PUBLIC,
  NICKNAME_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PUBLIC,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
  START_COMMAND,
} from '../commands';
import { TelegramChatTypeEnum } from '../enums/telegram-chat-type.enum';
import {
  OnCallbackQueryHandler,
  OnGetPlayersHandler,
  OnMemberLeftHandler,
  OnNewMemberHandler,
  OnSetGoalDoneHandler,
  OnSetGoalHandler,
  OnSetNationDoneHandler,
  OnSetNationHandler,
  OnSetNicknameDoneHandler,
  OnSetNicknameHandler,
  OnStartHandler,
} from '../handlers';
import { OnGetChannelScheduleHandler } from '../handlers/on-get-channel-schedule.handler';
import { PlayerContentRepository } from '../repositories/player-content.repository';
import { PlayerRepository } from '../repositories/player.repository';

@Injectable()
export class NezlamniBotService {
  /**
   * Event logger
   * @private
   */
  private static readonly logger: Logger = new Logger(NezlamniBotService.name);

  /**
   * Telegram bot
   * @private
   */
  private static bot: TelegramBot;

  /**
   * Telegram config from application
   * @private
   */
  private static config: ConfigType<typeof telegramConfig>;

  /**
   * Gameplay config from application
   * @private
   */
  private static gameplayConf: ConfigType<typeof gameplayConfig>;

  /**
   * Database repository for players
   * @private
   */
  private static playerRepository: PlayerRepository;

  /**
   * Database repository for players content
   * @private
   */
  private static playerContentRepository: PlayerContentRepository;

  /**
   * Session storage
   * @private
   */
  private static session: MemoryDbStorageProvider;

  /**
   * Constructor
   * @param {MemoryDbStorageProvider} session
   * @param {ConfigType<typeof telegramConfig>} telegramConf
   * @param {ConfigType<typeof gameplayConfig>} gameplayConf
   * @param {PlayerRepository} playerRepository
   * @param {PlayerContentRepository} playerContentRepository
   */
  constructor(
    @Inject(MemoryDbStorageProvider)
    private readonly session: MemoryDbStorageProvider,
    @Inject(telegramConfig.KEY)
    private telegramConf: ConfigType<typeof telegramConfig>,
    @Inject(gameplayConfig.KEY)
    private gameplayConf: ConfigType<typeof gameplayConfig>,
    private readonly playerRepository: PlayerRepository,
    private readonly playerContentRepository: PlayerContentRepository,
  ) {
    NezlamniBotService.config = telegramConf;
    NezlamniBotService.gameplayConf = gameplayConf;
    NezlamniBotService.session = session;
    NezlamniBotService.playerRepository = playerRepository;
    NezlamniBotService.playerContentRepository = playerContentRepository;
    NezlamniBotService.bot = new TelegramBot(
      NezlamniBotService.config.getToken(),
      {
        polling: NezlamniBotService.config.isPooling()
          ? {
              autoStart: NezlamniBotService.config.isPoolingAutoStart(),
              interval: NezlamniBotService.config.getPoolingInterval(),
              params: {
                timeout: NezlamniBotService.config.getPoolingTimeout(),
              },
            }
          : undefined,
      },
    );

    NezlamniBotService.logger.debug(
      `${NezlamniBotService.config.getBotName()} has been initialized`,
    );
    void this.initCommandsHandlers();
  }

  /**
   * Init chat bot commands handlers
   */
  async initCommandsHandlers(): Promise<void> {
    NezlamniBotService.bot.onText(START_COMMAND.REGEXP, this.onStart);
    NezlamniBotService.bot.onText(
      NICKNAME_COMMAND_PUBLIC.REGEXP,
      this.onSetNickname,
    );
    NezlamniBotService.bot.onText(
      NICKNAME_COMMAND_PRIVATE.REGEXP,
      this.onSetNickname,
    );
    NezlamniBotService.bot.onText(
      NATION_COMMAND_PUBLIC.REGEXP,
      this.onSetNation,
    );
    NezlamniBotService.bot.onText(
      NATION_COMMAND_PRIVATE.REGEXP,
      this.onSetNation,
    );
    NezlamniBotService.bot.onText(GOAL_COMMAND_PUBLIC.REGEXP, this.onSetGoal);
    NezlamniBotService.bot.onText(GOAL_COMMAND_PRIVATE.REGEXP, this.onSetGoal);
    NezlamniBotService.bot.onText(
      PLAYERS_LIST_COMMAND_PUBLIC.REGEXP,
      this.onPlayersList,
    );
    NezlamniBotService.bot.onText(
      PLAYERS_LIST_COMMAND_PRIVATE.REGEXP,
      this.onPlayersList,
    );
    NezlamniBotService.bot.onText(
      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.REGEXP,
      this.onChannelGameSchedule,
    );
    NezlamniBotService.bot.onText(
      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.REGEXP,
      this.onChannelGameSchedule,
    );
    NezlamniBotService.bot.on('new_chat_members', this.onNewMember);
    NezlamniBotService.bot.on('left_chat_member', this.onMemberLeft);
    NezlamniBotService.bot.on('message', this.onMessage);
    NezlamniBotService.bot.on('callback_query', this.onCallbackQuery);
    NezlamniBotService.bot.on('polling_error', this.onPoolingError);
    NezlamniBotService.bot.on('error', this.onFatalError);
  }

  /**
   * OnStart event /start
   * @param {Message} msg
   */
  async onStart(msg: Message): Promise<void> {
    if (!isEmpty(msg.text) && !msg.from.is_bot) {
      NezlamniBotService.logger.debug(`onStart event`);
      NezlamniBotService.logger.log(msg);
      await OnStartHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onNewMember event
   * @param {Message} msg
   */
  async onNewMember(msg: Message): Promise<void> {
    NezlamniBotService.logger.debug(`onNewMember event`);
    if (!msg.from.is_bot) {
      NezlamniBotService.logger.debug(`onNewMember event`);
      NezlamniBotService.logger.log(msg);
      await OnNewMemberHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onMemberLeft event
   * @param {Message} msg
   */
  async onMemberLeft(msg: Message): Promise<void> {
    if (!msg.from.is_bot) {
      NezlamniBotService.logger.debug(`onMemberLeft event`);
      NezlamniBotService.logger.log(msg);
      await OnMemberLeftHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.playerRepository,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onChannelGameSchedule event /schedule
   * @param {Message} msg
   */
  async onChannelGameSchedule(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      (msg.text === CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND ||
        msg.text === CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.COMMAND)
    ) {
      NezlamniBotService.logger.debug(`onChannelGameSchedule event`);
      NezlamniBotService.logger.log(msg);
      await OnGetChannelScheduleHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * OnSetNickname event /nickname
   * @param {Message} msg
   */
  async onSetNickname(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      (msg.text === NICKNAME_COMMAND_PUBLIC.COMMAND ||
        msg.text === NICKNAME_COMMAND_PRIVATE.COMMAND)
    ) {
      NezlamniBotService.logger.debug(`onSetNickname event`);
      NezlamniBotService.logger.log(msg);
      NezlamniBotService.session.destroy();
      NezlamniBotService.session.put(
        `${NICKNAME_COMMAND_PRIVATE.SESSION}${msg.from.id}`,
        msg.text,
      );
      await OnSetNicknameHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onSetNation event /nation
   * @param {Message} msg
   */
  async onSetNation(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      (msg.text === NATION_COMMAND_PUBLIC.COMMAND ||
        msg.text === NATION_COMMAND_PRIVATE.COMMAND)
    ) {
      NezlamniBotService.logger.debug(`onSetNation event`);
      NezlamniBotService.logger.log(msg);
      NezlamniBotService.session.destroy();
      NezlamniBotService.session.put(
        `${NATION_COMMAND_PRIVATE.SESSION}${msg.from.id}`,
        msg.text,
      );
      await OnSetNationHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onSetGoal event /goal
   * @param {Message} msg
   */
  async onSetGoal(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      (msg.text === GOAL_COMMAND_PUBLIC.COMMAND ||
        msg.text === GOAL_COMMAND_PRIVATE.COMMAND)
    ) {
      NezlamniBotService.logger.debug(`onSetGoal event`);
      NezlamniBotService.logger.log(msg);
      NezlamniBotService.session.destroy();
      NezlamniBotService.session.put(
        `${GOAL_COMMAND_PRIVATE.SESSION}${msg.from.id}`,
        msg.text,
      );
      await OnSetGoalHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.gameplayConf,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onPlayersList event /players
   * @param {Message} msg
   */
  async onPlayersList(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      (msg.text === PLAYERS_LIST_COMMAND_PRIVATE.COMMAND ||
        msg.text === PLAYERS_LIST_COMMAND_PUBLIC.COMMAND)
    ) {
      NezlamniBotService.logger.debug(`onPlayersList event`);
      NezlamniBotService.logger.log(msg);
      await OnGetPlayersHandler.init(
        NezlamniBotService.bot,
        msg,
        NezlamniBotService.config,
        NezlamniBotService.playerRepository,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onCallbackQuery event
   * @param {CallbackQuery} query
   */
  async onCallbackQuery(query: CallbackQuery): Promise<void> {
    if (
      !query.from.is_bot &&
      query.message.chat.type === TelegramChatTypeEnum.PRIVATE
    ) {
      NezlamniBotService.logger.debug(`onCallbackQuery event`);

      if (query.data === NICKNAME_COMMAND_PRIVATE.COMMAND)
        NezlamniBotService.session.put(
          `${NICKNAME_COMMAND_PRIVATE.SESSION}${query.from.id}`,
          query.data,
        );

      if (query.data === NATION_COMMAND_PRIVATE.COMMAND)
        NezlamniBotService.session.put(
          `${NATION_COMMAND_PRIVATE.SESSION}${query.from.id}`,
          query.data,
        );

      if (query.data === GOAL_COMMAND_PRIVATE.COMMAND)
        NezlamniBotService.session.put(
          `${GOAL_COMMAND_PRIVATE.SESSION}${query.from.id}`,
          query.data,
        );
      await OnCallbackQueryHandler.init(
        NezlamniBotService.bot,
        query,
        NezlamniBotService.config,
        NezlamniBotService.playerRepository,
        NezlamniBotService.logger,
      );
    }
  }

  /**
   * onMessage event
   * @param {Message} msg
   */
  async onMessage(msg: Message): Promise<void> {
    if (
      !msg.from.is_bot &&
      !msg.entities &&
      msg.chat.type === TelegramChatTypeEnum.PRIVATE
    ) {
      NezlamniBotService.logger.debug(`onMessage event`);
      NezlamniBotService.logger.log(msg);
      const sessionNicknameKey = `${NICKNAME_COMMAND_PRIVATE.SESSION}${msg.from.id}`;
      const sessionNationKey = `${NATION_COMMAND_PRIVATE.SESSION}${msg.from.id}`;
      const sessionGoalKey = `${GOAL_COMMAND_PRIVATE.SESSION}${msg.from.id}`;

      if (NezlamniBotService.session.has(sessionNicknameKey)) {
        await OnSetNicknameDoneHandler.init(
          NezlamniBotService.bot,
          msg,
          NezlamniBotService.config,
          NezlamniBotService.playerRepository,
          NezlamniBotService.logger,
        );
        NezlamniBotService.session.remove(sessionNicknameKey);
      } else if (NezlamniBotService.session.has(sessionNationKey)) {
        await OnSetNationDoneHandler.init(
          NezlamniBotService.bot,
          msg,
          NezlamniBotService.config,
          NezlamniBotService.playerRepository,
          NezlamniBotService.logger,
        );
        NezlamniBotService.session.remove(sessionNationKey);
      } else if (NezlamniBotService.session.has(sessionGoalKey)) {
        await OnSetGoalDoneHandler.init(
          NezlamniBotService.bot,
          msg,
          NezlamniBotService.config,
          NezlamniBotService.playerRepository,
          NezlamniBotService.playerContentRepository,
          NezlamniBotService.logger,
        );
        NezlamniBotService.session.remove(sessionGoalKey);
      }
    }
  }

  /**
   * onPoolingError event
   * @param {Error} error
   */
  onPoolingError(error: Error): void {
    NezlamniBotService.logger.debug(`onPoolingError event`);
    NezlamniBotService.logger.error(error);
  }

  /**
   * onFatalError event
   * @param {Error} error
   */
  onFatalError(error: Error): void {
    NezlamniBotService.logger.debug(`onFatalError event`);
    NezlamniBotService.logger.error(error);
  }
}
