import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import apiConfig from './configs/api.config';
import corsConfig from './configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: apiConfig().isLoggerEnabled()
      ? ['log', 'debug', 'error', 'warn', 'verbose']
      : false,
  });

  app.enableCors({
    origin: corsConfig().getAllowedOrigins(),
    methods: corsConfig().getAllowedMethods(),
    allowedHeaders: corsConfig().getAllowedHeaders(),
    exposedHeaders: corsConfig().getExposedHeaders(),
    credentials: corsConfig().requireCredentials(),
  });

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );

  await app.listen(apiConfig().getHttpsPort());
}

void bootstrap()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(
      'Service listening 👍: ',
      apiConfig().getEnvironment(),
      apiConfig().getVersion(),
      apiConfig().getHttpsPort(),
    );
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
