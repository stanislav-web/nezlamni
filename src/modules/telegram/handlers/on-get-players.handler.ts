import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { getBorderCharacters, table } from 'table';

import {
  findInArrayInsensitive,
  sortAscBy,
} from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { escapeString, isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
import {
  ERROR_GAP_MESSAGE,
  ERROR_GET_PLAYERS,
  PLAYERS_LIST_MESSAGE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

export class OnGetPlayersHandler {
  /**
   * OnGetPlayers event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    logger: Logger,
  ): Promise<void> {
    try {
      const players: Player[] = await playerRepository.findAll();
      if (!players)
        await bot.sendMessage(msg.chat.id, message(ERROR_GET_PLAYERS), {
          parse_mode: config.getMessageParseMode(),
          message_thread_id: msg?.message_thread_id || undefined,
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
              player.playerNation || '',
            ) as CountryListItemType;
            nation = !isEmpty(country) ? ` ${country?.flag}` : ` ${pNation}`;
          }

          content.push([
            `${++i}.`,
            ` [${player.telegramFirstName.trim()}](tg://user?id=${
              player.telegramUserId
            })`,
            ` (${escapeString(player.playerNickname)}${nation})`,
          ]);
        });
        await bot.sendMessage(
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
            message_thread_id: msg?.message_thread_id || undefined,
            parse_mode: config.getMessageParseMode(),
          },
        );
      }
    } catch (error) {
      logger.error(error);
      await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
        message_thread_id: msg?.message_thread_id || undefined,
        parse_mode: config.getMessageParseMode(),
      });
    }
  }
}
