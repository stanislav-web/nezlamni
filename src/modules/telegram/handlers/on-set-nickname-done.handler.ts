import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { MemoryDbStorageProvider } from '../../storage/providers/memory-db.provider';
import { NICKNAME_COMMAND } from '../commands';
import { ERROR_GAP_MESSAGE, ON_SET_NICKNAME_DONE_MESSAGE } from '../messages';

@Injectable()
export class OnSetNicknameDoneHandler {
  /**
   * OnSetNicknameDone event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {MemoryDbStorageProvider} session
   * @param {TelegramConfigType} config
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    session: MemoryDbStorageProvider,
    logger: Logger,
  ) {
    if (session.get(msg.chat.id) === NICKNAME_COMMAND.COMMAND) {
      void bot
        .sendMessage(
          msg.chat.id,
          message(ON_SET_NICKNAME_DONE_MESSAGE, {
            username: msg.from.first_name,
          }),
          {
            parse_mode: config.getMessageParseMode(),
          },
        )
        .catch((error) => {
          logger.error(error);
          void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
            parse_mode: config.getMessageParseMode(),
          });
        });
      session.remove(msg.chat.id);
    }
  }
}
