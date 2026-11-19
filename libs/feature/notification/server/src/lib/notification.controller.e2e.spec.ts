import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { Module } from '@nestjs/common'
import { UserRoles } from '@platon/core/common'
import { PubSubService } from '@platon/core/server'
import { createE2EApp, E2EContext, TestUser } from '@platon/core/testing/e2e-server'
import { Subject, filter, map } from 'rxjs'
import { IsNull, Repository } from 'typeorm'
import { NotificationController } from './notification.controller'
import { NotificationEntity } from './notification.entity'
import { NotificationService } from './notification.service'

const request = require('supertest')

/** Carries the messages within the process, serialized as Redis carries them between instances. */
const bus = new Subject<{ channel: string; payload: unknown }>()
const pubSub: Pick<PubSubService, 'publish' | 'observe'> = {
  publish: async (channel, payload) => bus.next({ channel, payload: JSON.parse(JSON.stringify(payload)) }),
  observe: <T>(channel: string) =>
    bus.pipe(
      filter((message) => message.channel === channel),
      map((message) => message.payload as T)
    ),
}

@Module({ providers: [{ provide: PubSubService, useValue: pubSub }], exports: [PubSubService] })
class InProcessPubSubModule {}

const SIGNAL = 'EXERCISE-CHANGES'

let ctx: E2EContext
let repository: Repository<NotificationEntity>
let service: NotificationService
let owner: TestUser
let other: TestUser

const http = () => request(ctx.app.getHttpServer())
const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

/** A notification of `user`, `minutes` after noon: the list shows the latest first. */
const seed = (user: TestUser, minutes: number, changes: Partial<NotificationEntity> = {}) =>
  repository.save(
    repository.create({
      userId: user.user.id,
      data: { type: 'COURSE-MEMBER-CREATION' },
      createdAt: new Date(Date.UTC(2026, 9, 9, 12, minutes)),
      readAt: null,
      ...changes,
    })
  )

/** Opens the stream as the browser does, and reads its events one at a time. */
const openStream = async (token: string) => {
  const abort = new AbortController()
  const response = await fetch(`${await ctx.app.getUrl()}/notifications/stream`, {
    headers: { ...auth(token), Accept: 'text/event-stream' },
    signal: abort.signal,
  })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const next = async (): Promise<unknown> => {
    for (;;) {
      const end = buffer.indexOf('\n\n')
      if (end >= 0) {
        const block = buffer.slice(0, end)
        buffer = buffer.slice(end + 2)
        const data = block
          .split('\n')
          .filter((line) => line.startsWith('data: '))
          .map((line) => line.slice('data: '.length))
          .join('\n')
        if (data) return JSON.parse(data)
        continue
      }
      const { value, done } = await reader.read()
      if (done) throw new Error('The stream ended')
      buffer += decoder.decode(value, { stream: true })
    }
  }
  return { response, next, close: () => abort.abort() }
}

beforeAll(async () => {
  ctx = await createE2EApp({
    entities: [NotificationEntity],
    controllers: [NotificationController],
    providers: [NotificationService],
    imports: [DiscoveryModule, InProcessPubSubModule],
  })
  owner = await ctx.createUser({ username: 'owner-e2e', role: UserRoles.student })
  other = await ctx.createUser({ username: 'other-e2e', role: UserRoles.teacher })
  repository = ctx.getRepository(NotificationEntity)
  service = ctx.app.get(NotificationService)
  service.declareSignals(SIGNAL)
  await ctx.app.listen(0, '127.0.0.1')
}, 60_000)

afterAll(async () => {
  await ctx.app.close()
  await ctx.db.teardown()
})

afterEach(async () => {
  await repository.query('TRUNCATE "Notifications" CASCADE')
})

describe('GET /notifications', () => {
  it('refuses a request without a token', async () => {
    await http().get('/notifications').expect(401)
  })

  it('lists the notifications of the person only, latest first, page by page', async () => {
    await seed(owner, 1)
    const middle = await seed(owner, 2)
    await seed(owner, 3)
    await seed(other, 4)

    const { body } = await http().get('/notifications?offset=1&limit=1').set(auth(owner.token)).expect(200)

    expect(body.total).toBe(3)
    expect(body.resources).toEqual([
      expect.objectContaining({ id: middle.id, userId: owner.user.id, data: { type: 'COURSE-MEMBER-CREATION' } }),
    ])
  })

  it('leaves the signals out when asked, and keeps them otherwise', async () => {
    await seed(owner, 1)
    await seed(owner, 2, { data: { type: SIGNAL } })

    const all = await http().get('/notifications').set(auth(owner.token)).expect(200)
    const informing = await http().get('/notifications?excludeSignals=true').set(auth(owner.token)).expect(200)

    expect(all.body.total).toBe(2)
    expect(informing.body.total).toBe(1)
  })

  it('refuses more than 50 notifications at a time', async () => {
    await http().get('/notifications?limit=51').set(auth(owner.token)).expect(400)
  })
})

describe('GET /notifications/unread-count', () => {
  it('counts the unread notifications of the person, without the signals or the read ones', async () => {
    await seed(owner, 1)
    await seed(owner, 2, { readAt: new Date() })
    await seed(owner, 3, { data: { type: SIGNAL } })
    await seed(other, 4)

    const { body } = await http().get('/notifications/unread-count').set(auth(owner.token)).expect(200)

    expect(body.resource).toBe(1)
  })
})

describe('PATCH /notifications', () => {
  it('marks a notification of the person as read, and leaves one of another person alone', async () => {
    const mine = await seed(owner, 1)
    const theirs = await seed(other, 2)

    await http().patch(`/notifications/${mine.id}/read`).set(auth(owner.token)).expect(200)
    await http().patch(`/notifications/${theirs.id}/read`).set(auth(owner.token)).expect(200)

    expect((await repository.findOneByOrFail({ id: mine.id })).readAt).toBeInstanceOf(Date)
    expect((await repository.findOneByOrFail({ id: theirs.id })).readAt).toBeNull()
  })

  it('marks all as read for the person only', async () => {
    await seed(owner, 1)
    await seed(owner, 2)
    const theirs = await seed(other, 3)

    await http().patch('/notifications/read').set(auth(owner.token)).expect(200)

    expect(await repository.countBy({ userId: owner.user.id, readAt: IsNull() })).toBe(0)
    expect((await repository.findOneByOrFail({ id: theirs.id })).readAt).toBeNull()
  })

  it('refuses an identifier that is not one', async () => {
    await http().patch('/notifications/not-an-id/read').set(auth(owner.token)).expect(400)
  })
})

describe('DELETE /notifications', () => {
  it('deletes a notification of the person, and leaves one of another person', async () => {
    const mine = await seed(owner, 1)
    const theirs = await seed(other, 2)

    await http().delete(`/notifications/${mine.id}`).set(auth(owner.token)).expect(200)
    await http().delete(`/notifications/${theirs.id}`).set(auth(owner.token)).expect(200)

    expect(await repository.findOneBy({ id: mine.id })).toBeNull()
    expect(await repository.findOneBy({ id: theirs.id })).not.toBeNull()
  })

  it('deletes all the notifications of the person only', async () => {
    await seed(owner, 1)
    await seed(owner, 2)
    await seed(other, 3)

    await http().delete('/notifications').set(auth(owner.token)).expect(200)

    expect(await repository.countBy({ userId: owner.user.id })).toBe(0)
    expect(await repository.countBy({ userId: other.user.id })).toBe(1)
  })
})

describe('GET /notifications/stream', () => {
  it('refuses a request without a token', async () => {
    await http().get('/notifications/stream').expect(401)
  })

  it('opens an SSE stream that gives the count, then each new notification of the person', async () => {
    await seed(owner, 1)
    const stream = await openStream(owner.token)
    try {
      expect(stream.response.status).toBe(200)
      expect(stream.response.headers.get('content-type')).toContain('text/event-stream')
      expect(stream.response.headers.get('x-accel-buffering')).toBe('no')
      expect(await stream.next()).toEqual({ unreadCount: 1 })

      await service.sendToUser(other.user.id, { type: 'COURSE-MEMBER-CREATION' })
      await service.sendToUser(owner.user.id, { type: 'COURSE-MEMBER-CREATION', courseName: 'Algorithmique' })

      expect(await stream.next()).toEqual({
        unreadCount: 2,
        notification: expect.objectContaining({
          userId: owner.user.id,
          data: { type: 'COURSE-MEMBER-CREATION', courseName: 'Algorithmique' },
        }),
      })
    } finally {
      stream.close()
    }
  })
})
