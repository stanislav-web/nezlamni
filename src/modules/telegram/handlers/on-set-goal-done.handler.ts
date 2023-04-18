import { Logger } from '@nestjs/common';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import {
  createResource,
  deleteResource,
  isResourceExist,
} from '../../../common/utils/file.util';
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
    if (!('caption' in msg) && !('video' in msg)) {
      await bot.sendMessage(msg.chat.id, message(ERROR_EMPTY), {
        parse_mode: config.getMessageParseMode(),
      });
    } else {
      const regex = /^(ЧС|ЛЧ|ЛЄ|ЛК|УПЛ|ПУЛ|ДУЛ),+.(.*)$/;
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
          const player: Player = await playerRepository.findOne({
            telegramUserId: msg.from.id,
          });
          if (isEmpty(player)) {
            await bot.sendMessage(msg.chat.id, message(ERROR_NOT_REGISTERED), {
              parse_mode: config.getMessageParseMode(),
            });
          } else {
            const playerContent = await playerContentRepository.findOne({
              player,
              type: PlayerContentTypeEnum.GOAL,
            });
            const uploadDir = `${config.getUploadFilesPath()}/${
              player.telegramUserId
            }/goals/`;
            const isFilePathExist = await isResourceExist(
              playerContent.filePath,
            );
            if (playerContent && isFilePathExist) {
              await deleteResource(playerContent.filePath);
            } else if (playerContent && !isFilePathExist) {
              await createResource(uploadDir);
            } else if (!playerContent && !isFilePathExist) {
              await createResource(uploadDir);
            }

            const uploadedFile = await bot.downloadFile(
              msg.video.file_id,
              uploadDir,
            );

            await playerContentRepository.add({
              player,
              type: PlayerContentTypeEnum.GOAL,
              caption,
              fileId: msg.video.file_id,
              filePath: uploadedFile,
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
