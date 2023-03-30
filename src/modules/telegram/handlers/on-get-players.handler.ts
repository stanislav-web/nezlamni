import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';

import { sortAscBy } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { escapeString } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { ERROR_GAP_MESSAGE, PLAYERS_LIST_MESSAGE } from '../messages';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

@Injectable()
export class OnGetPlayersHandler {
  /**
   * OnGetPlayers event handler
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
      .findAll()
      .then((players: Player[]) => {
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
          msg.chat.id,
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
      })
      .catch((error) => {
        logger.error(error);
        void bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      });
  }
}
