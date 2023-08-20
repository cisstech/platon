import { Injectable } from '@nestjs/common'
import { PubSub } from './pubsub'

@Injectable()
export class PubSubService {
  constructor(private readonly pubSub: PubSub) {}

  public async publish<T>(channel: string, payload: T): Promise<void> {
    await this.pubSub.publish(channel, payload)
  }

  public async subscribe<T>(channel: string, onMessage: (payload: T) => void): Promise<number> {
    return await this.pubSub.subscribe(channel, onMessage)
  }

  public unsubscribe(subId: number): void {
    this.pubSub.unsubscribe(subId)
  }

  public asyncIterator<T>(channel: string, initialValue?: T): AsyncIterator<T> {
    return initialValue
      ? this.pubSub.asyncIteratorWithInitialValue(channel, initialValue)
      : this.pubSub.asyncIterator(channel)
  }
}
