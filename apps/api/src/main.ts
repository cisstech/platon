/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

const LOG_LEVELS: LogLevel[] =
  process.env.NODE_ENV === 'development'
    ? ['debug', 'error', 'log', 'verbose', 'warn']
    : ['error', 'warn']

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: LOG_LEVELS,
  });


  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);


  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: false }))

  const port = process.env.PORT || 3333;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
