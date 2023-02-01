import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { DatabaseModule } from './database/database.module';
import { ErrorsModule } from './errors/errors.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    ErrorsModule,
  ],
  exports: [
    ConfigurationModule,
    DatabaseModule,
    ErrorsModule,
  ],
})
export class CoreServerModule {}
