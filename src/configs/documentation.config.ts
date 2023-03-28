import { registerAs } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { DocumentationConfigType } from './types/documentation.config.type';
import * as psjon from '../../package.json';
import { EnvironmentEnum } from '../common/enums/environment.enum';
import { getEnv } from '../common/utils/get-env.variable.util';

export default registerAs(
  'documentation',
  (): DocumentationConfigType => ({
    /**
     * Get Open API 3 compatible document
     * @return {Omit<OpenAPIObject, 'paths'>}
     */
    getOpenApiDocument: (): Omit<OpenAPIObject, 'paths'> => {
      const documentBuilder = new DocumentBuilder();
      const builder = documentBuilder
        .setTitle(getEnv('DOCUMENTATION_TITLE'))
        .setDescription(psjon.description)
        .setVersion(psjon.version)
        .setExternalDoc('Project repository', psjon.repository.url)
        .setContact(psjon.author.name, psjon.author.url, psjon.author.email)
        .setLicense(psjon.license, getEnv('DOCUMENTATION_LICENSE_URL'))
        .addSecurity('AUTH0-TOKEN', {
          type: 'http',
          description: 'Authorization: Bearer xxxx.xxxx.xxxx',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        })
        .addSecurity('API-KEY', {
          type: 'apiKey',
          name: 'X-Api-Key',
          description: 'X-Api-Key: xxxxxxxxxxxxxxxxxxxx',
          in: 'header',
        })
        .addServer(`http://localhost:${getEnv('HTTP_PORT')}`, 'LOCAL Server')
        .addServer(
          getEnv('DOCUMENTATION_DEV_SERVER'),
          `${EnvironmentEnum.DEVELOPMENT.toUpperCase()} Server`,
        )
        .addServer(
          getEnv('DOCUMENTATION_STAGE_SERVER'),
          `${EnvironmentEnum.STAGE.toUpperCase()} Server`,
        )
        .addServer(
          getEnv('DOCUMENTATION_PROD_SERVER'),
          `${EnvironmentEnum.PRODUCTION.toUpperCase()} Server`,
        );
      return builder.build();
    },
  }),
);
