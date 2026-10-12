import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'
import { Observable } from 'rxjs'
import { Configuration } from '../config/configuration'

interface Listener {
  readonly channel: string
  readonly onMessage: (payload: unknown) => void
}

/**
 * Messages between the instances of the API, through Redis channels: a message published on one
 * instance reaches the listeners of every instance. Payloads travel as JSON, so a date arrives as a
 * string.
 */
@Injectable()
export class PubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(PubSubService.name)
  private readonly publisher: Redis
  /** A connection that listens to a channel can send nothing else, hence a second one. */
  private readonly subscriber: Redis
  private readonly listeners = new Map<number, Listener>()
  /** The channels Redis listens to, each with the promise of its subscription. */
  private readonly channels = new Map<string, Promise<unknown>>()
  private lastId = 0

  constructor(config: ConfigService<Configuration>) {
    const options = {
      host: config.get('redis.host', { infer: true }),
      port: config.get('redis.port', { infer: true }),
    }
    this.publisher = new Redis(options)
    this.subscriber = new Redis(options)
    for (const connection of [this.publisher, this.subscriber]) {
      connection.on('error', (error: Error) => this.logger.error(`Redis: ${error.message}`))
    }
    this.subscriber.on('message', (channel: string, message: string) => this.dispatch(channel, message))
    // Redis listens again by itself to the channels it had accepted; a refused one is asked again here.
    this.subscriber.on('ready', () => {
      for (const { channel } of this.listeners.values()) {
        if (!this.channels.has(channel)) this.join(channel)
      }
    })
  }

  async publish<T>(channel: string, payload: T): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(payload))
  }

  /**
   * Calls `onMessage` with each message of the channel until {@link unsubscribe}.
   * @returns The identifier to unsubscribe with, once Redis listens to the channel. If Redis refuses,
   * the promise rejects and the listener stays: the channel is asked again when Redis is back.
   */
  async subscribe<T>(channel: string, onMessage: (payload: T) => void): Promise<number> {
    const id = this.listen(channel, onMessage as (payload: unknown) => void)
    await this.channels.get(channel)
    return id
  }

  unsubscribe(id: number): void {
    const listener = this.listeners.get(id)
    if (!listener) return
    this.listeners.delete(id)
    const { channel } = listener
    if ([...this.listeners.values()].some((other) => other.channel === channel)) return
    this.channels.delete(channel)
    this.subscriber.unsubscribe(channel).catch((error: Error) => this.logger.error(error.message))
  }

  /** The messages of the channel, for as long as the observable is subscribed. */
  observe<T>(channel: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const id = this.listen(channel, (payload) => subscriber.next(payload as T))
      return () => this.unsubscribe(id)
    })
  }

  /** Cuts the connections at once: a graceful quit would wait for a Redis that may be gone. */
  onModuleDestroy(): void {
    this.publisher.disconnect()
    this.subscriber.disconnect()
  }

  /** Registers the listener at once, and has Redis listen to the channel if no one did. */
  private listen(channel: string, onMessage: (payload: unknown) => void): number {
    const id = ++this.lastId
    this.listeners.set(id, { channel, onMessage })
    if (!this.channels.has(channel)) this.join(channel)
    return id
  }

  /** Has Redis listen to the channel. A refusal forgets the channel, so that it is asked again. */
  private join(channel: string): void {
    const joined = this.subscriber.subscribe(channel)
    this.channels.set(channel, joined)
    joined.catch((error: Error) => {
      this.logger.error(`Redis refused to listen to ${channel}: ${error.message}`)
      if (this.channels.get(channel) === joined) this.channels.delete(channel)
    })
  }

  private dispatch(channel: string, message: string): void {
    let payload: unknown
    try {
      payload = JSON.parse(message)
    } catch {
      this.logger.error(`Unreadable message on ${channel}`)
      return
    }
    for (const listener of [...this.listeners.values()]) {
      if (listener.channel !== channel) continue
      try {
        listener.onMessage(payload)
      } catch (error) {
        this.logger.error(`A listener of ${channel} failed: ${(error as Error).message}`)
      }
    }
  }
}
