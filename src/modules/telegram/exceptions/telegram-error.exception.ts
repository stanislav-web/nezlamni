import { HttpStatusDescriptionEnum } from '../../../common/enums/http-status-description.enum';
import { TelegramErrorEnum } from '../enums/telegram-error.enum';

export class TelegramErrorException extends Error {
  name: string;
  code: number;
  status: string;
  message: string;
  stack: string;

  constructor(error?: any) {
    super(error || 'An Error occurred.');
    this.name = 'Telegram Error';
    this.code = parseInt(error.code);
    this.message = TelegramErrorException.getMessage(error);
    this.status = TelegramErrorException.getStatusCode(this.code);
    this.stack = error;
  }

  private static getStatusCode(errorCode: number): HttpStatusDescriptionEnum {
    switch (errorCode) {
      case TelegramErrorEnum.ResourceNotFoundException:
        return HttpStatusDescriptionEnum.NOT_FOUND;
      default:
        return HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Get error message
   * @param {any} error
   * @private
   */
  private static getMessage(error: any) {
    return error.toString();
  }
}
