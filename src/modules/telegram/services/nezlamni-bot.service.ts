import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import TelegramBot, {
  CallbackQuery,
  ChatJoinRequest,
  Message,
} from 'node-telegram-bot-api';
import { isEmpty } from '../../../common/utils/string.util';
import { telegramConfig } from '../../../configs';
import { MemoryDbStorageProvider } from '../../storage/providers/memory-db.provider';
import {
  CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PUBLIC,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE,
  CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC,
  NICKNAME_COMMAND_PRIVATE,
  NICKNAME_COMMAND_PUBLIC,
  PLAYERS_LIST_COMMAND_PRIVATE,
  PLAYERS_LIST_COMMAND_PUBLIC,
  START_COMMAND,
} from '../commands';
import {
  OnCallbackQueryHandler,
  OnGetChannelGameChampionsHandler,
  OnGetPlayersHandler,
  OnMemberLeftHandler,
  OnNewMemberHandler,
  OnSetNicknameDoneHandler,
  OnSetNicknameHandler,
  OnStartHandler,
} from '../handlers';
import { OnGetChannelScheduleHandler } from '../handlers/on-get-channel-schedule.handler';
import { PlayerRepository } from '../repositories/player.repository';

@Injectable()
export class NezlamniBotService {
  /**
   * Event logger
   * @private
   */
  private readonly logger: Logger = new Logger(NezlamniBotService.name);

  /**
   * Telegram bot
   * @private
   */
  private readonly bot: TelegramBot;

  /**
   * Constructor
   * @param {ConfigType<typeof telegramConfig>} telegramConf
   * @param {MemoryDbStorageProvider} session
   * @param {PlayerRepository} playerRepository
   */
  constructor(
    @Inject(telegramConfig.KEY)
    private readonly telegramConf: ConfigType<typeof telegramConfig>,
    @Inject(MemoryDbStorageProvider)
    private readonly session: MemoryDbStorageProvider,
    private readonly playerRepository: PlayerRepository,
  ) {
    this.bot = new TelegramBot(this.telegramConf.getToken(), {
      polling: this.telegramConf.isPooling()
        ? {
            autoStart: this.telegramConf.isPoolingAutoStart(),
            interval: this.telegramConf.getPoolingInterval(),
            params: {
              timeout: this.telegramConf.getPoolingTimeout(),
            },
          }
        : undefined,
    });

    this.logger.debug(`${this.telegramConf.getBotName()} has been initialized`);
    this.bot.onText(START_COMMAND.REGEXP, this.onStart);
    this.bot.onText(NICKNAME_COMMAND_PUBLIC.REGEXP, this.onSetNickname);
    this.bot.onText(NICKNAME_COMMAND_PRIVATE.REGEXP, this.onSetNickname);
    this.bot.onText(PLAYERS_LIST_COMMAND_PUBLIC.REGEXP, this.onPlayersList);
    this.bot.onText(PLAYERS_LIST_COMMAND_PRIVATE.REGEXP, this.onPlayersList);
    this.bot.onText(
      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.REGEXP,
      this.onChannelGameSchedule,
    );
    this.bot.onText(
      CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.REGEXP,
      this.onChannelGameSchedule,
    );
    this.bot.onText(
      CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PUBLIC.REGEXP,
      this.onChannelGameChampions,
    );
    this.bot.onText(
      CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PRIVATE.REGEXP,
      this.onChannelGameChampions,
    );
    this.bot.on('new_chat_members', this.onNewMember);
    this.bot.on('chat_member_updated', this.onMemberUpdated);
    this.bot.on('left_chat_member', this.onMemberLeft);
    this.bot.on('chat_invite_link', this.onChatInviteLink);
    this.bot.on('chat_join_request', this.onChatJoinRequest);
    this.bot.on('message', this.onMessage);
    this.bot.on('callback_query', this.onCallbackQuery);
    // this.bot.on('inline_query', this.onInlineQuery);
    this.bot.on('polling_error', this.onPoolingError);
    this.bot.on('error', this.onFatalError);
  }

  /**
   * OnStart event /start
   * @param {Message} msg
   */
  private onStart = (msg: Message) => {
    this.logger.debug(`onStart event`);
    if (!isEmpty(msg.text) && !msg.from.is_bot)
      new OnStartHandler(this.bot, msg, this.telegramConf, this.logger);
  };

  /**
   * OnSetNickname event /nickname
   * @param {Message} msg
   */
  private onSetNickname = (msg: Message) => {
    this.logger.debug(`onSetNickname event`);
    this.logger.log(msg.text);
    if (
      !msg.from.is_bot &&
      (msg.text === NICKNAME_COMMAND_PUBLIC.COMMAND ||
        msg.text === NICKNAME_COMMAND_PRIVATE.COMMAND)
    )
      new OnSetNicknameHandler(this.bot, msg, this.telegramConf, this.logger);
  };

  /**
   * onPlayersList event /players
   * @param {Message} msg
   */
  private onPlayersList = (msg: Message) => {
    this.logger.debug(`onPlayersList event`);
    this.logger.log(msg);
    if (
      !msg.from.is_bot &&
      (msg.text === PLAYERS_LIST_COMMAND_PRIVATE.COMMAND ||
        msg.text === PLAYERS_LIST_COMMAND_PUBLIC.COMMAND)
    )
      new OnGetPlayersHandler(
        this.bot,
        msg,
        this.telegramConf,
        this.playerRepository,
        this.logger,
      );
  };

  /**
   * onChannelGameSchedule event /schedule
   * @param {Message} msg
   */
  private onChannelGameSchedule = (msg: Message) => {
    this.logger.debug(`onChannelGameSchedule event`);
    this.logger.log(msg);
    if (
      !msg.from.is_bot &&
      (msg.text === CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE.COMMAND ||
        msg.text === CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC.COMMAND)
    )
      new OnGetChannelScheduleHandler(
        this.bot,
        msg,
        this.telegramConf,
        this.logger,
      );
  };

  /**
   * onChannelGameChampions event /champions
   * @param {Message} msg
   */
  private onChannelGameChampions = (msg: Message) => {
    this.logger.debug(`onChannelGameChampions event`);
    this.logger.log(msg);
    if (
      !msg.from.is_bot &&
      (msg.text === CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PUBLIC.COMMAND ||
        msg.text === CHANNEL_GAMES_CHAMPIONS_LINK_COMMAND_PRIVATE.COMMAND)
    )
      new OnGetChannelGameChampionsHandler(
        this.bot,
        msg,
        this.telegramConf,
        this.logger,
      );
  };

  /**
   * onNewMember event
   * @param {Message} msg
   */
  private onNewMember = (msg: Message) => {
    this.logger.debug(`onNewMember event`);
    if (!msg.from.is_bot)
      new OnNewMemberHandler(this.bot, msg, this.telegramConf, this.logger);
  };

  /**
   * onMemberLeft event
   * @param {Message} msg
   */
  private onMemberLeft = (msg: Message) => {
    this.logger.debug(`onMemberLeft event`);
    if (!msg.from.is_bot)
      new OnMemberLeftHandler(
        this.bot,
        msg,
        this.telegramConf,
        this.playerRepository,
        this.logger,
      );
  };

  /**
   * onCallbackQuery event
   * @param {CallbackQuery} query
   */
  private onCallbackQuery = (query: CallbackQuery) => {
    this.logger.debug(`onCallbackQuery event`);
    if (!query.from.is_bot && query.message.chat.type === 'private') {
      this.session.put(query.message.chat.id, query.data);
      new OnCallbackQueryHandler(
        this.bot,
        query,
        this.telegramConf,
        this.playerRepository,
        this.logger,
      );
    }
  };

  /**
   * onInlineQuery event
   * @param {CallbackQuery} query
   */
  private onInlineQuery = (query: CallbackQuery) => {
    this.logger.debug(`onCallbackQuery event`);
    if (!query.from.is_bot && query.message.chat.type === 'private') {
      this.session.put(query.message.chat.id, query.data);
      new OnCallbackQueryHandler(
        this.bot,
        query,
        this.telegramConf,
        this.playerRepository,
        this.logger,
      );
    }
  };

  /**
   * onMessage event
   * @param {Message} msg
   */
  private onMessage = (msg: Message) => {
    this.logger.debug(`onMessage event`);
    this.logger.log(msg);
    if (!msg.from.is_bot && !msg.entities && msg.chat.type === 'private') {
      new OnSetNicknameDoneHandler(
        this.bot,
        msg,
        this.telegramConf,
        this.session,
        this.playerRepository,
        this.logger,
      );
    }
  };

  private onMemberUpdated = (msg: Message) => {
    this.logger.debug(`onMemberUpdated event`);
    this.logger.debug(msg);
  };

  private onChatInviteLink = (msg: Message) => {
    this.logger.debug(`onChatInviteLink event`);
    this.logger.debug(msg);
  };

  private onChatJoinRequest = (msg: ChatJoinRequest) => {
    this.logger.debug(`onChatJoinRequest event`);
    this.logger.debug(msg);
  };

  private onPoolingError = (error: Error) => {
    this.logger.debug(`onPoolingError event`);
    this.logger.error(error);
  };

  private onFatalError = (error: Error) => {
    this.logger.debug(`onFatalError event`);
    this.logger.error(error);
  };
}
