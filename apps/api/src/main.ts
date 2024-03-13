/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, LogLevel, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import type { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app/app.module'

const LOG_LEVELS: LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['debug', 'error', 'log', 'verbose', 'warn'] : ['error', 'warn']

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    logger: LOG_LEVELS,
  })

  app.useBodyParser('json', { limit: '10mb' })

  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  const config = new DocumentBuilder()
    .setTitle('PLaTon API')
    .setDescription('The PLaTon API description')
    .setVersion('1.0')
    .addTag('platon')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/doc', app, document)

  app.useLogger(app.get(Logger))
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      transform: true,
    })
  )

  const port = process.env.PORT || 4201
  await app.listen(port)

  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap().catch((err) => {
  Logger.error('Application failed to start', err)
})
