import { SetMetadata } from '@nestjs/common';

/**
 * Provide public access to endpoint
 * @constructor
 */
export const Public = () => SetMetadata('isPublic', true);
