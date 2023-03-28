import { HttpStatusDescriptionEnum } from '../../../common/enums/http-status-description.enum';
import { MemoryDbErrorEnum } from '../enums/memory-db-error.enum';

export class MemoryDbErrorException extends Error {
  name: string;
  code: number;
  status: string;
  message: string;
  stack: string;

  constructor(error: any, message: string) {
    super(error || 'An Error occurred.');
    this.name = 'Memory Db Error';
    this.code = error.code;
    this.message = message;
    this.status = MemoryDbErrorException.getStatusCode(error.code);
    this.stack = error;
  }

  private static getStatusCode(errorCode: string): HttpStatusDescriptionEnum {
    switch (errorCode) {
      case MemoryDbErrorEnum.ResourceNotFoundException:
        return HttpStatusDescriptionEnum.NOT_FOUND;
      case MemoryDbErrorEnum.ConflictException:
        return HttpStatusDescriptionEnum.CONFLICT;
      case MemoryDbErrorEnum.LimitExceededException:
        return HttpStatusDescriptionEnum.INSUFFICIENT_STORAGE;
      default:
        return HttpStatusDescriptionEnum.INTERNAL_SERVER_ERROR;
    }
  }
}
