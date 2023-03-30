import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, ON_MEMBER_LEFT } from '../messages';
import { PlayerRepository } from '../repositories/player.repository';

@Injectable()
export class OnMemberLeftHandler {
  /**
   * OnMemberLeft event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  constructor(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    logger: Logger,
  ) {
    void playerRepository
      .findOneAndRemove({
        telegramUserId: msg.left_chat_member.id,
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((_) =>
        bot.sendMessage(
          msg.chat.id,
          message(ON_MEMBER_LEFT, {
            username: msg.left_chat_member.first_name,
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
  }
}
