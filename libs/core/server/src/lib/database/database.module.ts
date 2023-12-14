import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { config } from './database.config'
import { DatabaseService } from './database.service'

@Global()
@Module({
  imports: [
    DiscoveryModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...config,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ConfigService, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
