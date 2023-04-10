import { SetMetadata } from '@nestjs/common';

/**
 * Provide static access to endpoint
 * @constructor
 */
export const Public = () => SetMetadata('isPublic', true);
