import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { User, UserRoles } from '@platon/core/common'
import { Connectivity } from '../../core/connectivity/connectivity'
import { Session } from '../../core/session/session'
import { PageNavigation } from '../../../shared/page-navigation'
import { loginGuard } from './login-guard'

@Component({ template: '' })
class Blank {}

const student = { id: 'u1', username: 'ib', role: UserRoles.student, active: true } as User

describe('loginGuard', () => {
  let session: { load: jest.Mock; signInWithToken: jest.Mock }
  let navigation: { assign: jest.Mock; replace: jest.Mock }
  let online: ReturnType<typeof signal<boolean>>

  const open = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: Blank, canActivate: [loginGuard] },
          { path: '**', component: Blank },
        ]),
        { provide: Session, useValue: session },
        { provide: PageNavigation, useValue: navigation },
        { provide: Connectivity, useValue: { online } },
      ],
    })
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url)
    return TestBed.inject(Router).url
  }

  beforeEach(() => {
    session = { load: jest.fn().mockResolvedValue(undefined), signInWithToken: jest.fn().mockResolvedValue(student) }
    navigation = { assign: jest.fn(), replace: jest.fn() }
    online = signal(true)
  })

  it('shows the page to a person without a session', async () => {
    expect(await open('/login?next=%2Fcourses')).toBe('/login?next=%2Fcourses')
  })

  it('sends a person already signed in to the next address', async () => {
    session.load.mockResolvedValue(student)

    expect(await open('/login?next=%2Fcourses%3Ftab%3Dmine')).toBe('/courses?tab=mine')
  })

  it('signs in with the tokens of the address, then opens the next address without them', async () => {
    expect(await open('/login?access-token=a&refresh-token=r&next=%2Fcourses%2F1')).toBe('/courses/1')
    expect(session.signInWithToken).toHaveBeenCalledWith({ accessToken: 'a', refreshToken: 'r' })
  })

  it('says on the page that the tokens were refused, and keeps the next address', async () => {
    session.signInWithToken.mockRejectedValue(new Error('auth/not-connected'))

    expect(await open('/login?access-token=a&refresh-token=r&next=%2Fcourses')).toBe(
      '/login?error=token&next=%2Fcourses'
    )
  })

  it('keeps the tokens of the address unspent while the device is offline, and says so', async () => {
    online.set(false)

    expect(await open('/login?access-token=a&refresh-token=r&next=%2Fcourses')).toBe(
      '/login?error=offline&next=%2Fcourses'
    )
    expect(session.signInWithToken).not.toHaveBeenCalled()
  })

  it('leaves the step of an external application to the current interface', async () => {
    await open('/login?callbackUrl=https%3A%2F%2Fapp.example&callbackTitle=Atelier')

    expect(navigation.replace).toHaveBeenCalledWith(
      '/login?callbackUrl=https%3A%2F%2Fapp.example&callbackTitle=Atelier&ui=legacy-once'
    )
  })
})
