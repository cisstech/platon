
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Configuration } from '../config/configuration';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (
        configService: ConfigService<Configuration>
      ) => new RedisPubSub({
        connection: {
          host: configService.get('redis.host', { infer: true }),
          port: configService.get('redis.port', { infer: true }),
        }
      }),
      inject: [ConfigService]
    }
  ],
  exports: [
    PUB_SUB,
  ],
})
export class PubSubModule { }
