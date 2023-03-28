/**
 * Http response messages for Swagger automation
 */
export enum HttpStatusDescriptionEnum {
  BAD_REQUEST = 'Invalid input data',
  CONFLICT = 'Entity has already been used',
  CREATED = 'Created',
  FORBIDDEN = 'Access forbidden. Invalid role',
  INSUFFICIENT_STORAGE = 'Insufficient Storage',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  NOT_FOUND = 'Entity was not found',
  NO_CONTENT = 'No Content',
  OK = 'Success',
  UNAUTHORIZED = 'Invalid auth credentials',
  UNPROCESSABLE_ENTITY = 'Invalid input syntax or media content',
  UNSUPPORTED_MEDIA_TYPE = 'Unsupported media type',
}
