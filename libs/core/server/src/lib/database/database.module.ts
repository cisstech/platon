import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => (config),
      inject: [ConfigService]
    }),
  ],
  providers: [ConfigService],
})
export class DatabaseModule { }

