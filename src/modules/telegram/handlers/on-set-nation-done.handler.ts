import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { findInArrayInsensitive } from '../../../common/utils/array.util';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import {
  countries,
  CountryListItemType,
} from '../../../data/country-list.data';
import {
  ERROR_EMPTY,
  ERROR_GAP_MESSAGE,
  ERROR_SET_NATION_CONFLICT,
  ERROR_SET_NATION_FORMAT,
  ERROR_NOT_REGISTERED,
  ON_SET_NATION_DONE_MESSAGE,
} from '../messages';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

export class OnSetNationDoneHandler {
  /**
   * @param {PlayerRepository} playerRepository
   * @private
   */
  private static playerRepository: PlayerRepository;

  /**
   * OnSetNationDone event handler
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
    OnSetNationDoneHandler.playerRepository = playerRepository;
    if (!('text' in msg)) {
      await bot.sendMessage(msg.chat.id, message(ERROR_EMPTY), {
        parse_mode: config.getMessageParseMode(),
      });
    } else {
      const text = msg.text.trim();
      try {
        const player: Player =
          await OnSetNationDoneHandler.playerRepository.findOne({
            telegramUserId: msg.from.id,
          });
        if (isEmpty(player)) {
          await bot.sendMessage(msg.chat.id, message(ERROR_NOT_REGISTERED), {
            parse_mode: config.getMessageParseMode(),
          });
        } else {
          const countryByCode: CountryListItemType | object =
            findInArrayInsensitive(countries, 'code', text);
          const countryByName: CountryListItemType | object =
            findInArrayInsensitive(countries, 'name', text);
          if (isEmpty(countryByCode) && isEmpty(countryByName)) {
            await bot.sendMessage(
              msg.chat.id,
              message(ERROR_SET_NATION_FORMAT),
              {
                parse_mode: config.getMessageParseMode(),
              },
            );
          } else {
            const country = countryByCode
              ? (countryByCode as CountryListItemType)
              : (countryByName as CountryListItemType);
            const player: Player =
              await OnSetNationDoneHandler.playerRepository.findOne({
                playerNation: country.code,
              });
            if (!isEmpty(player)) {
              await bot.sendMessage(
                msg.chat.id,
                message(ERROR_SET_NATION_CONFLICT, {
                  nation: text,
                  userId: player.telegramUserId,
                  username: player.telegramFirstName,
                }),
                {
                  parse_mode: config.getMessageParseMode(),
                },
              );
            } else {
              await OnSetNationDoneHandler.playerRepository.findOneAndUpdate(
                {
                  telegramUserId: msg.from.id,
                },
                { playerNation: country.code },
              );
              await bot.sendMessage(
                msg.chat.id,
                message(ON_SET_NATION_DONE_MESSAGE, {
                  country: country.name,
                  scheduleLink: config.getChannelGamesScheduleLink(),
                }),
                {
                  disable_web_page_preview: true,
                  parse_mode: config.getMessageParseMode(),
                },
              );
            }
          }
        }
      } catch (error) {
        logger.error(error);
        await bot.sendMessage(msg.chat.id, message(ERROR_GAP_MESSAGE), {
          parse_mode: config.getMessageParseMode(),
        });
      }
    }
  }
}
