import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthService } from '@platon/core/browser/shared'
import { User, UserRoles } from '@platon/core/common'
import { Session } from './session'

const teacher = { id: '1', username: 'khaddad', role: UserRoles.teacher, active: true } as User

describe('Session', () => {
  let ready: jest.Mock
  let signOut: jest.Mock
  let navigateByUrl: jest.Mock
  let session: Session

  beforeEach(() => {
    ready = jest.fn().mockResolvedValue(teacher)
    signOut = jest.fn().mockResolvedValue(undefined)
    navigateByUrl = jest.fn().mockResolvedValue(true)
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { ready, signOut } },
        { provide: Router, useValue: { navigateByUrl } },
      ],
    })
    session = TestBed.inject(Session)
  })

  it('loads the user once, however many times it is asked', async () => {
    const [first, second] = await Promise.all([session.load(), session.load()])
    await session.load()
    expect(first).toBe(teacher)
    expect(second).toBe(teacher)
    expect(ready).toHaveBeenCalledTimes(1)
    expect(session.user()).toBe(teacher)
  })

  it('derives the role helpers from the user', async () => {
    expect(session.isTeacher()).toBe(false)
    await session.load()
    expect(session.role()).toBe(UserRoles.teacher)
    expect(session.isTeacher()).toBe(true)
    expect(session.isAdmin()).toBe(false)
  })

  it('removes the token before leaving for the sign-in page', async () => {
    await session.load()
    navigateByUrl.mockImplementation(() => {
      expect(signOut).toHaveBeenCalledWith(false)
      expect(session.user()).toBeUndefined()
      return Promise.resolve(true)
    })
    await session.signOut()
    expect(navigateByUrl).toHaveBeenCalledWith('/login', { replaceUrl: true })
  })

  it('forgets the user on sign out, and loads it again afterwards', async () => {
    await session.load()
    await session.signOut()
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(session.user()).toBeUndefined()
    await session.load()
    expect(ready).toHaveBeenCalledTimes(2)
  })
})
