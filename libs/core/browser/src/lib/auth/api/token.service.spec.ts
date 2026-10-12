import { HttpErrorResponse } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { AuthToken } from '@platon/core/common'
import { TokenProvider } from '../models/token-provider'
import { TokenService } from './token.service'

const base64url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const jwt = (claims: object) => `${base64url({ alg: 'HS256' })}.${base64url(claims)}.signature`
const inSeconds = (seconds: number) => Math.floor(Date.now() / 1000) + seconds

const session = (access: object): AuthToken => ({
  accessToken: jwt({ sub: 'u1', ...access }),
  refreshToken: jwt({ sub: 'u1', typ: 'refresh', exp: inSeconds(3600) }),
})
const renewed: AuthToken = session({ typ: 'access', exp: inSeconds(900), renewed: true })

describe('TokenService', () => {
  let provider: { token: jest.Mock; refresh: jest.Mock; remove: jest.Mock; save: jest.Mock; obtain: jest.Mock }
  let tokens: TokenService

  beforeEach(() => {
    provider = {
      token: jest.fn().mockResolvedValue(session({ typ: 'access', exp: inSeconds(900) })),
      refresh: jest.fn().mockResolvedValue(renewed),
      remove: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      obtain: jest.fn(),
    }
    TestBed.configureTestingModule({ providers: [{ provide: TokenProvider, useValue: provider }] })
    tokens = TestBed.inject(TokenService)
  })

  afterEach(() => jest.useRealTimers())

  it('asks the API once for renewals asked at the same time', async () => {
    const [first, second] = await Promise.all([tokens.refresh(), tokens.refresh()])

    expect(provider.refresh).toHaveBeenCalledTimes(1)
    expect(first).toBe(renewed)
    expect(second).toBe(renewed)
  })

  it('gives a fresh token as it is, and renews first one that has expired or has no type', async () => {
    expect(await tokens.fresh()).toEqual(expect.objectContaining({ refreshToken: expect.any(String) }))
    expect(provider.refresh).not.toHaveBeenCalled()

    provider.token.mockResolvedValue(session({ typ: 'access', exp: inSeconds(-10) }))
    expect(await tokens.fresh()).toBe(renewed)
    provider.token.mockResolvedValue(session({ exp: inSeconds(900) }))
    expect(await tokens.fresh()).toBe(renewed)
    expect(provider.refresh).toHaveBeenCalledTimes(2)
  })

  it('ends the session when the API refuses the renewal, and keeps it when the API does not answer', async () => {
    provider.refresh.mockRejectedValueOnce(new HttpErrorResponse({ status: 502 }))
    await tokens.refresh().then(
      () => {
        throw new Error('The renewal should fail')
      },
      () => undefined
    )
    expect(provider.remove).not.toHaveBeenCalled()

    provider.refresh.mockRejectedValueOnce(new HttpErrorResponse({ status: 401 }))
    await tokens.refresh().then(
      () => {
        throw new Error('The renewal should fail')
      },
      () => undefined
    )
    expect(provider.remove).toHaveBeenCalledTimes(1)
  })

  it('gives up a renewal that hangs after 15 s, so that the next one can start', async () => {
    jest.useFakeTimers()
    provider.refresh.mockReturnValueOnce(new Promise(() => undefined))
    const failed = jest.fn()

    tokens.refresh().then(undefined, failed)
    await jest.advanceTimersByTimeAsync(15_000)
    expect(failed).toHaveBeenCalled()

    await expect(tokens.refresh()).resolves.toBe(renewed)
    expect(provider.refresh).toHaveBeenCalledTimes(2)
  })

  it('lets a sign-in made during a renewal win: the renewal no longer stands for the session', async () => {
    let finish: (token: AuthToken) => void = () => undefined
    provider.refresh.mockReturnValueOnce(new Promise<AuthToken>((resolve) => (finish = resolve)))
    const signedIn = session({ typ: 'access', exp: inSeconds(900), other: true })
    tokens.refresh().catch(() => undefined)

    await tokens.save(signedIn)
    provider.token.mockResolvedValue(signedIn)
    finish(renewed)

    expect(await tokens.token()).toBe(signedIn)
  })
})
