import { Redis } from 'ioredis'
import { firstValueFrom, take, toArray } from 'rxjs'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { PubSubService } from './pubsub.service'

describe('PubSubService (integration)', () => {
  let redis: StartedTestContainer
  let probe: Redis
  let first: PubSubService
  let second: PubSubService

  const connect = () => {
    const values: Record<string, unknown> = { 'redis.host': redis.getHost(), 'redis.port': redis.getMappedPort(6379) }
    return new PubSubService({ get: (key: string) => values[key] } as never)
  }

  beforeAll(async () => {
    redis = await new GenericContainer('redis:6-alpine').withExposedPorts(6379).start()
    probe = new Redis({ host: redis.getHost(), port: redis.getMappedPort(6379) })
    first = connect()
    second = connect()
  }, 60_000)

  afterAll(async () => {
    first.onModuleDestroy()
    second.onModuleDestroy()
    await probe.quit()
    await redis.stop()
  })

  /** How many connections listen to the channel, as Redis counts them. */
  const listeners = async (channel: string): Promise<number> => {
    const [, count] = (await probe.pubsub('NUMSUB', channel)) as [string, number]
    return Number(count)
  }

  /** How many connections listen to the channel, once Redis counts `count` or after two seconds. */
  const listenedBy = async (channel: string, count: number): Promise<number> => {
    const deadline = Date.now() + 2_000
    let current = await listeners(channel)
    while (current !== count && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      current = await listeners(channel)
    }
    return current
  }

  it('hands one instance of the API the message another one published', async () => {
    const received = firstValueFrom(second.observe<{ userId: string }>('changes').pipe(take(2), toArray()))
    expect(await listenedBy('changes', 1)).toBe(1)

    await first.publish('changes', { userId: 'u1' })
    await first.publish('changes', { userId: 'u2' })

    await expect(received).resolves.toEqual([{ userId: 'u1' }, { userId: 'u2' }])
  })

  it('stops listening to a channel once nobody follows it', async () => {
    const subscription = second.observe('presence').subscribe()
    expect(await listenedBy('presence', 1)).toBe(1)

    subscription.unsubscribe()

    expect(await listenedBy('presence', 0)).toBe(0)
  })
})
