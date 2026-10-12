import { Test } from '@nestjs/testing'
import { AuthService } from '@platon/core/server'
import { Optional } from 'typescript-optional'
import { LmsEntity } from './entities/lms.entity'
import { LmsUserEntity } from './entities/lms-user.entity'
import { LTIMiddleware } from './lti.middleware'
import { LTIService } from './lti.service'
import { LTIProvider } from './provider'

jest.mock('./provider', () => ({
  LTIProvider: jest.fn(),
}))

describe('LTIMiddleware', () => {
  let middleware: LTIMiddleware
  let lti: jest.Mocked<Pick<LTIService, 'findLmsByConsumerKey' | 'withLmsUser' | 'interceptLaunch'>>
  let authService: jest.Mocked<Pick<AuthService, 'authenticate'>>
  let next: jest.Mock
  let res: { redirect: jest.Mock }

  beforeEach(async () => {
    lti = {
      findLmsByConsumerKey: jest.fn(),
      withLmsUser: jest.fn(),
      interceptLaunch: jest.fn().mockResolvedValue(undefined),
    }
    authService = { authenticate: jest.fn() }
    next = jest.fn()
    res = { redirect: jest.fn() }
    ;(LTIProvider as unknown as jest.Mock).mockReset()

    const module = await Test.createTestingModule({
      providers: [
        LTIMiddleware,
        { provide: LTIService, useValue: lti },
        { provide: AuthService, useValue: authService },
      ],
    }).compile()

    middleware = module.get(LTIMiddleware)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("devrait passer au middleware suivant si le corps n'a pas de oauth_consumer_key", async () => {
    const req = { body: {}, query: {} } as never

    await middleware.use(req, res as never, next)

    expect(next).toHaveBeenCalled()
    expect(lti.findLmsByConsumerKey).not.toHaveBeenCalled()
  })

  it('devrait rediriger vers / si aucun LMS ne correspond au consumer key', async () => {
    lti.findLmsByConsumerKey.mockResolvedValue(Optional.empty())
    const req = { body: { oauth_consumer_key: 'unknown' }, query: {} } as never

    await middleware.use(req, res as never, next)

    expect(res.redirect).toHaveBeenCalledWith(302, '/')
    expect(next).not.toHaveBeenCalled()
  })

  it('devrait rediriger vers / si la validation du provider LTI échoue', async () => {
    const lms = { id: 'lms-1', name: 'Moodle', consumerKey: 'key', consumerSecret: 'secret' } as LmsEntity
    lti.findLmsByConsumerKey.mockResolvedValue(Optional.of(lms))
    const validate = jest.fn().mockRejectedValue(new Error('Invalid Signature'))
    ;(LTIProvider as unknown as jest.Mock).mockImplementation(() => ({ validate, body: {} }))

    const req = { body: { oauth_consumer_key: 'key' }, query: {} } as never

    await middleware.use(req, res as never, next)

    expect(res.redirect).toHaveBeenCalledWith(302, '/')
    expect(lti.withLmsUser).not.toHaveBeenCalled()
  })

  it('devrait authentifier et rediriger avec les tokens sur un lancement LTI valide', async () => {
    const lms = { id: 'lms-1', name: 'Moodle', consumerKey: 'key', consumerSecret: 'secret' } as LmsEntity
    lti.findLmsByConsumerKey.mockResolvedValue(Optional.of(lms))

    const payload = { user_id: 'ext-1' }
    const validate = jest.fn().mockResolvedValue(payload)
    ;(LTIProvider as unknown as jest.Mock).mockImplementation(() => ({ validate, body: payload }))

    const lmsUser = { id: 'lmsuser-1', user: { id: 'user-1', username: 'john' } } as LmsUserEntity
    lti.withLmsUser.mockResolvedValue(lmsUser)
    authService.authenticate.mockResolvedValue({ accessToken: 'access-token', refreshToken: 'refresh-token' } as never)

    const req = { body: { oauth_consumer_key: 'key' }, query: { next: '/course/1' } } as never

    await middleware.use(req, res as never, next)

    expect(lti.withLmsUser).toHaveBeenCalledWith(lms, payload)
    expect(authService.authenticate).toHaveBeenCalledWith('user-1', 'john')
    expect(lti.interceptLaunch).toHaveBeenCalledWith({
      lms,
      lmsUser,
      payload,
      nextUrl: '/course/1',
    })
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/login?access-token=access-token&refresh-token=refresh-token&next=%2Fcourse%2F1'
    )
  })

  it("devrait mener à l'adresse que les intercepteurs ont réécrite, encodée", async () => {
    const lms = { id: 'lms-1', name: 'Moodle', consumerKey: 'key', consumerSecret: 'secret' } as LmsEntity
    lti.findLmsByConsumerKey.mockResolvedValue(Optional.of(lms))
    const payload = { user_id: 'ext-1' }
    ;(LTIProvider as unknown as jest.Mock).mockImplementation(() => ({ validate: jest.fn(), body: payload }))
    lti.withLmsUser.mockResolvedValue({ id: 'lmsuser-1', user: { id: 'user-1', username: 'john' } } as LmsUserEntity)
    authService.authenticate.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' } as never)
    lti.interceptLaunch.mockImplementation(async (args: { nextUrl: string }) => {
      args.nextUrl = '/player/activity/a1?x=1&y=2'
    })

    await middleware.use({ body: { oauth_consumer_key: 'key' }, query: {} } as never, res as never, next)

    expect(res.redirect).toHaveBeenCalledWith(
      302,
      '/login?access-token=a&refresh-token=r&next=%2Fplayer%2Factivity%2Fa1%3Fx%3D1%26y%3D2'
    )
  })

  it("devrait utiliser '/' comme nextUrl par défaut si absent de la query", async () => {
    const lms = { id: 'lms-1', name: 'Moodle', consumerKey: 'key', consumerSecret: 'secret' } as LmsEntity
    lti.findLmsByConsumerKey.mockResolvedValue(Optional.of(lms))

    const payload = { user_id: 'ext-1' }
    const validate = jest.fn().mockResolvedValue(payload)
    ;(LTIProvider as unknown as jest.Mock).mockImplementation(() => ({ validate, body: payload }))

    const lmsUser = { id: 'lmsuser-1', user: { id: 'user-1', username: 'john' } } as LmsUserEntity
    lti.withLmsUser.mockResolvedValue(lmsUser)
    authService.authenticate.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' } as never)

    const req = { body: { oauth_consumer_key: 'key' }, query: {} } as never

    await middleware.use(req, res as never, next)

    expect(lti.interceptLaunch).toHaveBeenCalledWith(expect.objectContaining({ nextUrl: '/' }))
  })
})
