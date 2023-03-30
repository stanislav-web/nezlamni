import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { MemoryDbStorageProvider } from '../../storage/providers/memory-db.provider';
import { NICKNAME_COMMAND_PUBLIC } from '../commands';
import { ERROR_GAP_MESSAGE, ON_SET_NICKNAME_DONE_MESSAGE } from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

@Injectable()
export class OnSetNicknameDoneHandler {
  /**
   * OnSetNicknameDone event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {MemoryDbStorageProvider} session
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    session: MemoryDbStorageProvider,
    playerRepository: PlayerRepository,
    logger: Logger,
  ) {
    if (session.get(msg.chat.id) === NICKNAME_COMMAND_PUBLIC.COMMAND) {
      playerRepository
        .findOneAndUpdate(
          {
            telegramUserId: msg.from.id,
          },
          {
            telegramChannelId: config.getNotificationChannel(),
            playerNickname: msg.text,
            telegramFirstName: msg.from.first_name,
          },
        )
        .then((result) =>
          isEmpty(result)
            ? playerRepository.create({
                telegramChannelId: config.getNotificationChannel(),
                telegramUserId: msg.from.id,
                telegramFirstName: msg.from.first_name,
                telegramUsername: msg.from?.username || 'undefined',
                playerNickname: msg.text,
              })
            : result,
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .then((_) =>
          bot.sendMessage(
            msg.chat.id,
            message(ON_SET_NICKNAME_DONE_MESSAGE, {
              username: msg.from.first_name,
            }),
            {
              parse_mode: config.getMessageParseMode(),
            },
          ),
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
