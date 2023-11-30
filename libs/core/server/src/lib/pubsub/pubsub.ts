/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Configuration } from '../config/configuration'

@Injectable()
export class PubSub extends RedisPubSub {
  constructor(configService: ConfigService<Configuration>) {
    super({
      connection: {
        host: configService.get('redis.host', { infer: true }),
        port: configService.get('redis.port', { infer: true }),
      },
    })
  }

  private withInitialValue<T>(iterator: AsyncIterator<T>, initialValue: T): AsyncIterator<T> {
    let pushed = false
    return {
      async next(value?: unknown): Promise<IteratorResult<T>> {
        if (pushed) {
          return iterator.next(value as any)
        } else {
          pushed = true
          return { done: false, value: initialValue }
        }
      },
      return(value?: unknown): Promise<IteratorResult<T>> {
        return iterator.return!(value as T)
      },
      throw(value?: unknown): Promise<IteratorResult<T>> {
        return iterator.throw!(value)
      },
    }
  }

  public asyncIteratorWithInitialValue<T>(triggers: string | string[], initialValue: T): AsyncIterator<T> {
    return this.withInitialValue(this.asyncIterator<T>(triggers), initialValue)
  }
}
