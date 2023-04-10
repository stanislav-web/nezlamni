import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { message } from '../../../common/utils/placeholder.util';
import { isEmpty } from '../../../common/utils/string.util';
import { TelegramConfigType } from '../../../configs/types/telegram.config.type';
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';
import {
  ERROR_EMPTY,
  ERROR_GAP_MESSAGE,
  ERROR_NOT_REGISTERED,
  ERROR_SET_GOAL_CAPTION_FORMAT,
  ON_SET_GOAL_DONE_MESSAGE,
} from '../messages';
import { PlayerContentRepository } from '../repositories/player-content.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../schemas/player.schema';

export class OnSetGoalDoneHandler {
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
   * OnSetGoalDone event handler
   * @param {TelegramBot} bot
   * @param {Message} msg
   * @param {TelegramConfigType} config
   * @param {PlayerRepository} playerRepository
   * @param {PlayerContentRepository} playerContentRepository
   * @param {Logger} logger
   */
  static async init(
    bot: TelegramBot,
    msg: Message,
    config: TelegramConfigType,
    playerRepository: PlayerRepository,
    playerContentRepository: PlayerContentRepository,
    logger: Logger,
  ): Promise<void> {
    OnSetGoalDoneHandler.playerRepository = playerRepository;
    OnSetGoalDoneHandler.playerContentRepository = playerContentRepository;
    if (!('caption' in msg) && !('video' in msg)) {
      await bot.sendMessage(msg.chat.id, message(ERROR_EMPTY), {
        parse_mode: config.getMessageParseMode(),
      });
    } else {
      const regex = /^(ЧС|ЛЧ|ЛЄ|УПЛ|ПУЛ),+.(.*)$/;
      const caption = msg.caption.trim();
      if (!regex.test(caption)) {
        await bot.sendMessage(
          msg.chat.id,
          message(ERROR_SET_GOAL_CAPTION_FORMAT),
          {
            parse_mode: config.getMessageParseMode(),
          },
        );
      } else {
        try {
          const player: Player =
            await OnSetGoalDoneHandler.playerRepository.findOne({
              telegramUserId: msg.from.id,
            });
          if (isEmpty(player)) {
            await bot.sendMessage(msg.chat.id, message(ERROR_NOT_REGISTERED), {
              parse_mode: config.getMessageParseMode(),
            });
          } else {
            const uploadDir = `${config.getUploadFilesPath()}/goals/`;
            const uploadFile = await bot.downloadFile(
              msg.video.file_id,
              uploadDir,
            );

            await OnSetGoalDoneHandler.playerContentRepository.add({
              player,
              type: PlayerContentTypeEnum.GOAL,
              caption,
              fileId: msg.video.file_id,
              filePath: uploadFile,
            });
            await bot.sendMessage(
              msg.chat.id,
              message(ON_SET_GOAL_DONE_MESSAGE, {
                scheduleLink: config.getChannelGamesScheduleLink(),
              }),
              {
                disable_web_page_preview: true,
                parse_mode: config.getMessageParseMode(),
              },
            );
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
}
