import { OpenAPIObject } from '@nestjs/swagger';

export type DocumentationConfigType = {
  /**
   * Get Open API 3 compatible document
   * @return {Omit<OpenAPIObject, 'paths'>}
   */
  getOpenApiDocument(): Omit<OpenAPIObject, 'paths'>;
};
