import { Logger, Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ErrorsFilter } from './errors.filter'

@Module({
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: ErrorsFilter,
    },
  ],
  exports: [],
})
export class ErrorsModule {}
