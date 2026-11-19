import { HttpErrorResponse } from '@angular/common/http'
import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { of, throwError } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { Session } from '../../core/session/session'
import { LoginApi } from './login-api'
import { LoginStore } from './login-store'

describe('LoginStore', () => {
  let session: { signIn: jest.Mock }
  let api: { casNames: jest.Mock }
  let store: LoginStore

  beforeEach(() => {
    session = { signIn: jest.fn().mockResolvedValue({ id: 'u1' }) }
    api = { casNames: jest.fn(() => of(['univ-eiffel'])) }
    TestBed.configureTestingModule({
      providers: [
        LoginStore,
        { provide: Session, useValue: session },
        { provide: LoginApi, useValue: api },
        { provide: Connectivity, useValue: { online: signal(true) } },
      ],
    })
    store = TestBed.inject(LoginStore)
  })

  /** Lets the promises of the store settle. */
  const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

  it('lists the institution accounts, and says when the list fails', async () => {
    store.load()
    expect(store.casStatus()).toBe('loading')
    await settle()
    expect(store.cas()).toEqual(['univ-eiffel'])
    expect(store.casStatus()).toBe('ready')

    api.casNames.mockReturnValue(throwError(() => new Error('down')))
    store.loadCas()
    await settle()
    expect(store.cas()).toEqual([])
    expect(store.casStatus()).toBe('error')
  })

  it('starts from the failure the address brings', () => {
    store.load('cas')

    expect(store.failure()).toBe('cas')
  })

  it('asks for both fields before calling the API', async () => {
    expect(await store.signIn('  ', 'secret')).toBe(false)

    expect(store.failure()).toBe('missing')
    expect(session.signIn).not.toHaveBeenCalled()
  })

  it('signs in, and keeps saying it works until the page leaves', async () => {
    store.load('token')

    expect(await store.signIn(' sophie.lambert ', 'secret')).toBe(true)

    expect(session.signIn).toHaveBeenCalledWith('sophie.lambert', 'secret')
    expect(store.submitting()).toBe(true)
    expect(store.failure()).toBeUndefined()
  })

  it('tells PLaTon not answering from the connection lost', async () => {
    const online = TestBed.inject(Connectivity).online as ReturnType<typeof signal<boolean>>
    session.signIn.mockRejectedValue(new HttpErrorResponse({ status: 502 }))
    await store.signIn('sophie.lambert', 'secret')
    expect(store.failure()).toBe('server')

    online.set(false)
    session.signIn.mockRejectedValue(new HttpErrorResponse({ status: 0 }))
    await store.signIn('sophie.lambert', 'secret')
    expect(store.failure()).toBe('offline')
  })

  it('stops a sign-in that cannot go on, with its failure', async () => {
    await store.signIn('sophie.lambert', 'secret')

    store.stopWith('server')

    expect(store.submitting()).toBe(false)
    expect(store.failure()).toBe('server')
  })

  it('says refused credentials, and lets the person try again', async () => {
    session.signIn.mockRejectedValue(new HttpErrorResponse({ status: 400 }))

    expect(await store.signIn('sophie.lambert', 'wrong')).toBe(false)

    expect(store.failure()).toBe('credentials')
    expect(store.submitting()).toBe(false)
  })
})
