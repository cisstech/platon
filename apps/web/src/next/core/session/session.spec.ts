import { TestBed } from '@angular/core/testing'
import { AuthService } from '@platon/core/browser/shared'
import { User, UserRoles } from '@platon/core/common'
import { PageNavigation } from '../../../shared/page-navigation'
import { Session } from './session'

const teacher = { id: '1', username: 'khaddad', role: UserRoles.teacher, active: true } as User
const token = { accessToken: 'access', refreshToken: 'refresh' }

describe('Session', () => {
  let auth: { ready: jest.Mock; signIn: jest.Mock; signInWithToken: jest.Mock; signOut: jest.Mock }
  let navigation: { replace: jest.Mock }
  let session: Session

  beforeEach(() => {
    auth = {
      ready: jest.fn().mockResolvedValue(teacher),
      signIn: jest.fn().mockResolvedValue(teacher),
      signInWithToken: jest.fn().mockResolvedValue(teacher),
      signOut: jest.fn().mockResolvedValue(undefined),
    }
    navigation = { replace: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: PageNavigation, useValue: navigation },
      ],
    })
    session = TestBed.inject(Session)
  })

  it('loads the user once, however many times it is asked', async () => {
    const [first, second] = await Promise.all([session.load(), session.load()])
    await session.load()
    expect(first).toBe(teacher)
    expect(second).toBe(teacher)
    expect(auth.ready).toHaveBeenCalledTimes(1)
    expect(session.user()).toBe(teacher)
  })

  it('derives the role helpers from the user', async () => {
    expect(session.isTeacher()).toBe(false)
    await session.load()
    expect(session.role()).toBe(UserRoles.teacher)
    expect(session.isTeacher()).toBe(true)
    expect(session.isAdmin()).toBe(false)
  })

  it('signs in after finding nobody, so that the guard lets the person through', async () => {
    auth.ready.mockResolvedValue(undefined)
    expect(await session.load()).toBeUndefined()

    await session.signIn('khaddad', 'secret')

    expect(auth.signIn).toHaveBeenCalledWith('khaddad', 'secret')
    expect(session.user()).toBe(teacher)
    expect(await session.load()).toBe(teacher)
    expect(auth.ready).toHaveBeenCalledTimes(1)
  })

  it('signs in with the tokens of an address', async () => {
    await session.signInWithToken(token)

    expect(auth.signInWithToken).toHaveBeenCalledWith(token)
    expect(session.user()).toBe(teacher)
  })

  it('refuses tokens that bring nobody, and forgets them', async () => {
    auth.signInWithToken.mockResolvedValue(undefined)

    await expect(session.signInWithToken(token)).rejects.toThrow()

    expect(auth.signOut).toHaveBeenCalledWith(false)
    expect(session.user()).toBeUndefined()
  })

  it('removes the token, then reloads the sign-in page, so that nothing of the person stays in memory', async () => {
    await session.load()
    navigation.replace.mockImplementation(() => {
      expect(auth.signOut).toHaveBeenCalledWith(false)
      expect(session.user()).toBeUndefined()
    })

    await session.signOut()

    expect(navigation.replace).toHaveBeenCalledWith('/login')
  })
})
