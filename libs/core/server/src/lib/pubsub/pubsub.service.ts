import { Inject, Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const PUB_SUB = 'PUB_SUB';

@Injectable()
export class PubSubService {
  constructor(
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}


  async publish<T>(channel: string, payload: T): Promise<void> {
    await this.pubSub.publish(channel, payload);
  }

  async subscribe<T>(channel: string, onMessage: (payload: T) => void): Promise<number> {
    return await this.pubSub.subscribe(channel, onMessage);
  }

  unsubscribe(subId: number): void {
    this.pubSub.unsubscribe(subId);
  }

  asyncIterator<T>(channel: string): AsyncIterator<T> {
    return this.pubSub.asyncIterator(channel);
  }
}
