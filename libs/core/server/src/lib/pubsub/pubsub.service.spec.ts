import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Redis } from 'ioredis'
import { PubSubService } from './pubsub.service'

jest.mock('ioredis', () => {
  const { EventEmitter } = jest.requireActual('events')
  class Redis extends EventEmitter {
    static readonly instances: Redis[] = []
    readonly publish = jest.fn().mockResolvedValue(1)
    readonly subscribe = jest.fn().mockResolvedValue(1)
    readonly unsubscribe = jest.fn().mockResolvedValue(0)
    readonly disconnect = jest.fn()
    constructor(readonly options: unknown) {
      super()
      Redis.instances.push(this)
    }
  }
  return { Redis }
})

type FakeRedis = Redis & { options: unknown } & {
  [K in 'publish' | 'subscribe' | 'unsubscribe' | 'disconnect']: jest.Mock
}

const instances = (Redis as unknown as { instances: FakeRedis[] }).instances

describe('PubSubService', () => {
  let service: PubSubService
  let publisher: FakeRedis
  let subscriber: FakeRedis

  beforeEach(async () => {
    instances.length = 0
    const config = { get: jest.fn((key: string) => ({ 'redis.host': 'redis', 'redis.port': 6379 }[key])) }
    const module = await Test.createTestingModule({
      providers: [PubSubService, { provide: ConfigService, useValue: config }],
    }).compile()
    service = module.get(PubSubService)
    ;[publisher, subscriber] = instances
  })

  /** Lets the answers of the fake Redis come back. */
  const settle = () => new Promise<void>((resolve) => setImmediate(resolve))

  it('opens two connections to Redis, one to publish and one to listen', () => {
    expect(instances).toHaveLength(2)
    expect(publisher.options).toEqual({ host: 'redis', port: 6379 })
    expect(subscriber.options).toEqual({ host: 'redis', port: 6379 })
  })

  it('publishes the message as JSON on the channel', async () => {
    await service.publish('changes', { userId: 'u1' })

    expect(publisher.publish).toHaveBeenCalledWith('changes', '{"userId":"u1"}')
  })

  it('hands each listener of a channel the messages of that channel only', async () => {
    const first = jest.fn()
    const second = jest.fn()
    const other = jest.fn()
    await service.subscribe('changes', first)
    await service.subscribe('changes', second)
    await service.subscribe('presence', other)

    subscriber.emit('message', 'changes', '{"userId":"u1"}')

    expect(first).toHaveBeenCalledWith({ userId: 'u1' })
    expect(second).toHaveBeenCalledWith({ userId: 'u1' })
    expect(other).not.toHaveBeenCalled()
  })

  it('listens to a channel once for all its listeners, and leaves it after the last one', async () => {
    const first = await service.subscribe('changes', jest.fn())
    const second = await service.subscribe('changes', jest.fn())
    expect(subscriber.subscribe).toHaveBeenCalledTimes(1)
    expect(subscriber.subscribe).toHaveBeenCalledWith('changes')

    service.unsubscribe(first)
    expect(subscriber.unsubscribe).not.toHaveBeenCalled()

    service.unsubscribe(second)
    expect(subscriber.unsubscribe).toHaveBeenCalledWith('changes')
  })

  it('skips an unreadable message without losing the next ones', async () => {
    const onMessage = jest.fn()
    await service.subscribe('changes', onMessage)

    subscriber.emit('message', 'changes', 'not json')
    subscriber.emit('message', 'changes', '{"userId":"u2"}')

    expect(onMessage).toHaveBeenCalledTimes(1)
    expect(onMessage).toHaveBeenCalledWith({ userId: 'u2' })
  })

  it('listens to the channel while the observable is subscribed, and leaves it afterwards', () => {
    const received: unknown[] = []

    const subscription = service.observe('changes').subscribe((payload) => received.push(payload))
    subscriber.emit('message', 'changes', '{"userId":"u1"}')
    subscription.unsubscribe()
    subscriber.emit('message', 'changes', '{"userId":"u2"}')

    expect(received).toEqual([{ userId: 'u1' }])
    expect(subscriber.subscribe).toHaveBeenCalledWith('changes')
    expect(subscriber.unsubscribe).toHaveBeenCalledWith('changes')
  })

  it('hands the message to the other listeners when one of them fails', async () => {
    const failing = jest.fn(() => {
      throw new Error('broken listener')
    })
    const working = jest.fn()
    await service.subscribe('changes', failing)
    await service.subscribe('changes', working)

    subscriber.emit('message', 'changes', '{"userId":"u1"}')

    expect(working).toHaveBeenCalledWith({ userId: 'u1' })
  })

  it('asks again for a channel Redis refused, on the next listener and on reconnection', async () => {
    subscriber.subscribe.mockRejectedValueOnce(new Error('Connection is closed.'))

    await expect(service.subscribe('changes', jest.fn())).rejects.toThrow('Connection is closed.')
    service.observe('changes').subscribe()
    await settle()
    expect(subscriber.subscribe).toHaveBeenCalledTimes(2)

    subscriber.subscribe.mockRejectedValueOnce(new Error('Connection is closed.'))
    service.observe('presence').subscribe()
    await settle()
    subscriber.emit('ready')

    expect(subscriber.subscribe).toHaveBeenLastCalledWith('presence')
    expect(subscriber.subscribe).toHaveBeenCalledTimes(4)
  })

  it('cuts both connections when the API stops, without waiting for an unreachable Redis', async () => {
    await service.onModuleDestroy()

    expect(publisher.disconnect).toHaveBeenCalled()
    expect(subscriber.disconnect).toHaveBeenCalled()
  })
})
