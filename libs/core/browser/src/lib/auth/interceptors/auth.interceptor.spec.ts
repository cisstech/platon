import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'
import { AuthToken, TOKEN_EXPIRED_ERROR_CODE } from '@platon/core/common'
import { of } from 'rxjs'
import { StorageService } from '../../services/storage.service'
import { TokenService } from '../api/token.service'
import { TokenProvider } from '../models/token-provider'
import { RemoteTokenProvider } from '../providers/remote-token.provider'
import { AuthInterceptor } from './auth.interceptor'

const KEY = 'auth-token'
const REFRESH = '/api/v1/auth/refresh/'
const EXPIRED = { statusCode: 401, message: TOKEN_EXPIRED_ERROR_CODE }

const base64url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
/** A token the browser can read; only the API checks the signature. */
const jwt = (claims: object) => `${base64url({ alg: 'HS256' })}.${base64url(claims)}.signature`
const inSeconds = (seconds: number) => Math.floor(Date.now() / 1000) + seconds

const access = (name: string, expiresIn = 900) =>
  jwt({ sub: 'u1', username: 'ib', typ: 'access', exp: inSeconds(expiresIn), name })
const untypedAccess = (name: string) => jwt({ sub: 'u1', username: 'ib', exp: inSeconds(900), name })
const refresh = (expiresIn = 3600) => jwt({ sub: 'u1', typ: 'refresh', exp: inSeconds(expiresIn) })

/** The tokens of the session, as IndexedDB keeps them. */
class MemoryStorage {
  readonly values = new Map<string, unknown>()
  get = (key: string) => of(this.values.get(key))
  set = (key: string, value: unknown) => {
    this.values.set(key, value)
    return of(undefined)
  }
  remove = (key: string) => {
    this.values.delete(key)
    return of(undefined)
  }
}

describe('AuthInterceptor', () => {
  let http: HttpClient
  let api: HttpTestingController
  let storage: MemoryStorage
  let session: AuthToken
  let renewed: AuthToken

  /** Lets the stored token be read and the requests go out. */
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

  const expire = (url: string) => api.expectOne(url).flush(EXPIRED, { status: 401, statusText: 'Unauthorized' })

  const bearer = (url: string, method = 'GET') => {
    const request = api.expectOne({ url, method })
    return { request, authorization: request.request.headers.get('Authorization') }
  }

  const renew = (answer: AuthToken = renewed) => {
    const post = bearer(REFRESH, 'POST')
    expect(post.authorization).toBe(`Bearer ${session.refreshToken}`)
    post.request.flush({ resource: answer })
  }

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    storage = new MemoryStorage()
    session = { accessToken: access('first'), refreshToken: refresh() }
    renewed = { accessToken: access('renewed'), refreshToken: session.refreshToken }
    storage.values.set(KEY, session)
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: TokenProvider, useClass: RemoteTokenProvider },
        { provide: StorageService, useValue: storage },
      ],
    })
    http = TestBed.inject(HttpClient)
    api = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    api.verify()
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('sends the access token with each request, and leaves alone a request that names its own', async () => {
    http.get('/api/v1/courses').subscribe()
    http.get('/api/v1/other', { headers: { Authorization: 'Bearer given' } }).subscribe()
    await settle()

    expect(bearer('/api/v1/courses').authorization).toBe(`Bearer ${session.accessToken}`)
    expect(bearer('/api/v1/other').authorization).toBe('Bearer given')
  })

  /** A request with this stored access token goes out only after a renewal, with the renewed token. */
  const renewsBeforeSending = async (accessToken: string) => {
    session = { accessToken, refreshToken: refresh() }
    renewed = { accessToken: access('renewed'), refreshToken: session.refreshToken }
    storage.values.set(KEY, session)

    http.post('/api/v1/player/evaluate', {}).subscribe()
    await settle()
    api.expectNone('/api/v1/player/evaluate')
    renew()
    await settle()

    expect(bearer('/api/v1/player/evaluate', 'POST').authorization).toBe(`Bearer ${renewed.accessToken}`)
  }

  it('renews before sending an access token that has expired, which a public route would serve as nobody', () =>
    renewsBeforeSending(access('expired', -60)))

  it('renews before sending an access token that has no type', () => renewsBeforeSending(untypedAccess('untyped')))

  it('renews once for requests the API finds expired together, then sends each again', async () => {
    const answers: unknown[] = []
    http.get('/api/v1/a').subscribe((body) => answers.push(body))
    http.get('/api/v1/b').subscribe((body) => answers.push(body))
    await settle()

    expire('/api/v1/a')
    expire('/api/v1/b')
    await settle()
    renew()
    await settle()

    const a = bearer('/api/v1/a')
    const b = bearer('/api/v1/b')
    expect([a.authorization, b.authorization]).toEqual([
      `Bearer ${renewed.accessToken}`,
      `Bearer ${renewed.accessToken}`,
    ])
    a.request.flush('a')
    b.request.flush('b')
    expect(answers).toEqual(['a', 'b'])
  })

  it('sends again with the token another request has renewed meanwhile, without renewing twice', async () => {
    http.get('/api/v1/a').subscribe()
    http.get('/api/v1/b').subscribe()
    await settle()
    expire('/api/v1/a')
    await settle()
    renew()
    await settle()
    bearer('/api/v1/a').request.flush('a')

    expire('/api/v1/b')
    await settle()

    api.expectNone(REFRESH)
    expect(bearer('/api/v1/b').authorization).toBe(`Bearer ${renewed.accessToken}`)
  })

  it('sends a request made during a renewal with the new token', async () => {
    http.get('/api/v1/a').subscribe()
    await settle()
    expire('/api/v1/a')
    await settle()

    http.get('/api/v1/c').subscribe()
    await settle()
    api.expectNone('/api/v1/c')
    renew()
    await settle()

    expect(bearer('/api/v1/c').authorization).toBe(`Bearer ${renewed.accessToken}`)
    expect(bearer('/api/v1/a').authorization).toBe(`Bearer ${renewed.accessToken}`)
  })

  it('keeps both tokens the API gives back, where both the requests and the subscriptions read them', async () => {
    const typed = refresh(600)
    http.get('/api/v1/a').subscribe()
    await settle()
    expire('/api/v1/a')
    await settle()

    renew({ accessToken: renewed.accessToken, refreshToken: typed })
    await settle()
    bearer('/api/v1/a').request.flush('a')

    expect(storage.values.get(KEY)).toEqual({ accessToken: renewed.accessToken, refreshToken: typed })
    expect(TestBed.inject(TokenService).tokenSync()).toEqual({ accessToken: renewed.accessToken, refreshToken: typed })
  })

  it('fails every waiting request and ends the session when the API refuses the renewal, with one renewal', async () => {
    const failures: number[] = []
    http.get('/api/v1/a').subscribe({ error: (error) => failures.push(error.status) })
    await settle()
    expire('/api/v1/a')
    await settle()
    http.get('/api/v1/c').subscribe({ error: (error) => failures.push(error.status) })
    await settle()

    bearer(REFRESH, 'POST').request.flush({ statusCode: 401 }, { status: 401, statusText: 'Unauthorized' })
    await settle()
    bearer('/api/v1/c').request.flush({ statusCode: 401 }, { status: 401, statusText: 'Unauthorized' })
    await settle()

    expect(failures).toEqual([401, 401])
    expect(storage.values.has(KEY)).toBe(false)
  })

  it('keeps the session when the API does not answer the renewal, for the next request to try again', async () => {
    const failures: number[] = []
    http.get('/api/v1/a').subscribe({ error: (error) => failures.push(error.status) })
    await settle()
    expire('/api/v1/a')
    await settle()

    bearer(REFRESH, 'POST').request.flush(null, { status: 502, statusText: 'Bad Gateway' })
    await settle()

    expect(failures).toEqual([401])
    expect(storage.values.get(KEY)).toEqual(session)
  })

  it('ends the session without asking the API when the refresh token has expired', async () => {
    storage.values.set(KEY, { accessToken: access('expired', -60), refreshToken: refresh(-60) })

    http.get('/api/v1/a').subscribe()
    await settle()

    api.expectNone(REFRESH)
    expect(bearer('/api/v1/a').authorization).toBeNull()
    expect(storage.values.has(KEY)).toBe(false)
  })

  it('lets a sign-in during a renewal win: its session stays', async () => {
    const signedIn: AuthToken = { accessToken: access('signed-in'), refreshToken: refresh(7200) }
    http.get('/api/v1/a').subscribe()
    await settle()
    expire('/api/v1/a')
    await settle()

    await TestBed.inject(TokenService).save(signedIn)
    renew()
    await settle()

    expect(bearer('/api/v1/a').authorization).toBe(`Bearer ${signedIn.accessToken}`)
    expect(storage.values.get(KEY)).toEqual(signedIn)
  })

  it('renews for a request that asked for text, whose error body is text too', async () => {
    http.get('/api/v1/files/a', { responseType: 'text' }).subscribe()
    await settle()

    api.expectOne('/api/v1/files/a').flush(JSON.stringify(EXPIRED), { status: 401, statusText: 'Unauthorized' })
    await settle()
    renew()
    await settle()

    expect(bearer('/api/v1/files/a').authorization).toBe(`Bearer ${renewed.accessToken}`)
  })
})
