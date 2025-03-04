import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { config } from './database.config'
import { DatabaseService } from './database.service'
import { DataSource } from 'typeorm'

@Global()
@Module({
  imports: [
    DiscoveryModule,
    TypeOrmModule.forRootAsync({
      dataSourceFactory: async (options) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const dataSource = new DataSource(options!)
        // @ts-expect-error TypeORM does not support but the database supports
        // https://github.com/typeorm/typeorm/issues/10056
        dataSource.driver.supportedDataTypes.push('vector')
        await dataSource.initialize()
        return dataSource
      },
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
