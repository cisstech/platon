// The auth routes over HTTP, with real signed tokens and the real AuthModule (its strategies, guards
// and controller) and error filter; only the users are mocked, so no database is needed.
const request = require('supertest')
import { Controller, Get, INestApplication, Module, Req } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { TOKEN_EXPIRED_ERROR_CODE } from '@platon/core/common'
import { createUserEntity } from '@platon/core/testing/server'
import { Optional } from 'typescript-optional'
import { ErrorsModule } from '../errors/errors.module'
import { UserModule } from '../users/user.module'
import { UserService } from '../users/user.service'
import { AuthModule } from './auth.module'
import { IRequest, TokenPayload } from './auth.types'
import { Public } from './decorators/public.decorator'

const SECRET = 'test-secret'
const ACCESS_LIFETIME = 15 * 60

const user = createUserEntity({ id: 'user-1', username: 'ib' })

const users = {
  findByIdOrName: jest.fn(async (idOrName: string) => (idOrName === user.id ? Optional.of(user) : Optional.empty())),
  updateLastActivity: jest.fn().mockResolvedValue(undefined),
  touchLastLogin: jest.fn().mockResolvedValue(undefined),
}

@Module({ providers: [{ provide: UserService, useValue: users }], exports: [UserService] })
class FakeUserModule {}

@Controller('probe')
class ProbeController {
  @Get()
  whoAmI(@Req() req: IRequest) {
    return { id: req.user.id }
  }

  @Public()
  @Get('public')
  whoIsThere(@Req() req: IRequest) {
    return { id: req.user?.id ?? null }
  }
}

let app: INestApplication
let jwt: JwtService

const http = () => request(app.getHttpServer())
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })
const claims = (token: string) => jwt.decode<TokenPayload & { exp: number }>(token)
const inSeconds = (seconds: number) => Math.floor(Date.now() / 1000) + seconds
const sign = (payload: object) => jwt.signAsync(payload, { secret: SECRET })
const tokensOf = async (id = user.id) => {
  const { body } = await http()
    .post('/auth/refresh')
    .set(bearer(await sign({ sub: id, username: 'ib', typ: 'refresh', exp: inSeconds(3600) })))
  return body.resource as { accessToken: string; refreshToken: string }
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        ignoreEnvFile: true,
        load: [() => ({ secret: SECRET, auth: { accessLifetime: '15m', refreshLifetime: '7d', salt: 10 } })],
      }),
      AuthModule,
      ErrorsModule,
    ],
    controllers: [ProbeController],
  })
    .overrideModule(UserModule)
    .useModule(FakeUserModule)
    .compile()
  app = moduleRef.createNestApplication()
  await app.init()
  jwt = moduleRef.get(JwtService)
})

afterAll(() => app.close())

describe('session tokens', () => {
  it('opens a route with the access token, and refuses the refresh token for what it is', async () => {
    const refreshToken = await sign({ sub: user.id, username: 'ib', typ: 'refresh', exp: inSeconds(3600) })
    const { accessToken } = await tokensOf()

    await http().get('/probe').set(bearer(accessToken)).expect(200, { id: user.id })
    const { body } = await http().get('/probe').set(bearer(refreshToken)).expect(401)
    expect(body.message).toBe('An access token is expected')
  })

  it('renews with the refresh token: an access token for the access lifetime, and the same refresh token', async () => {
    const refreshToken = await sign({ sub: user.id, username: 'ib', typ: 'refresh', exp: inSeconds(3600) })

    const { body } = await http().post('/auth/refresh').set(bearer(refreshToken)).expect(201)

    expect(body.resource.refreshToken).toBe(refreshToken)
    const access = claims(body.resource.accessToken)
    expect(access.typ).toBe('access')
    expect(access.exp).toBeGreaterThanOrEqual(inSeconds(ACCESS_LIFETIME - 5))
    expect(access.exp).toBeLessThanOrEqual(inSeconds(ACCESS_LIFETIME))
  })

  it('refuses to renew an access token, an expired refresh token, a missing one, or one whose person is gone', async () => {
    const { accessToken } = await tokensOf()
    const expired = await sign({ sub: user.id, username: 'ib', typ: 'refresh', exp: inSeconds(-10) })
    const orphan = await sign({ sub: 'gone', username: 'gone', typ: 'refresh', exp: inSeconds(3600) })

    const refused = [
      await http().post('/auth/refresh').set(bearer(accessToken)).expect(401),
      await http().post('/auth/refresh').set(bearer(expired)).expect(401),
      await http().post('/auth/refresh').expect(401),
      await http().post('/auth/refresh').set(bearer(orphan)).expect(401),
    ]

    expect(refused.map(({ body }) => body.message)).toEqual([
      'A refresh token is expected',
      'The session has ended',
      'The session has ended',
      'The user of the token no longer exists',
    ])
  })

  it('never gives an access token that outlives the session of its refresh token', async () => {
    const ending = await sign({ sub: user.id, username: 'ib', typ: 'refresh', exp: inSeconds(300) })

    const { body } = await http().post('/auth/refresh').set(bearer(ending)).expect(201)

    expect(claims(body.resource.accessToken).exp).toBe(claims(ending).exp)
  })

  it('lets a public route see the person of a valid access token, and nobody for an expired one', async () => {
    const { accessToken } = await tokensOf()
    const expired = await sign({ sub: user.id, username: 'ib', typ: 'access', exp: inSeconds(-10) })

    await http().get('/probe/public').set(bearer(accessToken)).expect(200, { id: user.id })
    await http().get('/probe/public').set(bearer(expired)).expect(200, { id: null })
    const { body } = await http().get('/probe').set(bearer(expired)).expect(401)
    expect(body.message).toBe(TOKEN_EXPIRED_ERROR_CODE)
  })

  describe('an untyped token', () => {
    let untyped: string

    beforeAll(async () => {
      untyped = await sign({ sub: user.id, username: 'ib', exp: inSeconds(600) })
    })

    it('still opens the routes until it expires, so that its session goes on', async () => {
      await http().get('/probe').set(bearer(untyped)).expect(200, { id: user.id })
      await http().get('/probe/public').set(bearer(untyped)).expect(200, { id: user.id })
    })

    it('renews into typed tokens that end when it ends', async () => {
      const { body } = await http().post('/auth/refresh').set(bearer(untyped)).expect(201)

      const { accessToken, refreshToken } = body.resource
      expect(claims(refreshToken)).toEqual(expect.objectContaining({ typ: 'refresh', exp: claims(untyped).exp }))
      expect(claims(accessToken)).toEqual(expect.objectContaining({ typ: 'access', exp: claims(untyped).exp }))
      await http().get('/probe').set(bearer(accessToken)).expect(200)
    })

    it('does not renew without an end', async () => {
      const endless = await sign({ sub: user.id, username: 'ib' })

      const { body } = await http().post('/auth/refresh').set(bearer(endless)).expect(401)

      expect(body.message).toBe('A refresh token is expected')
    })
  })
})
