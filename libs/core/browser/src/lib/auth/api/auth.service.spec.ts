import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthProvider } from '../models/auth-provider'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  it('removes the token before leaving for the sign-in page, which may load anew and cut the removal', async () => {
    const steps: string[] = []
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthProvider, useValue: { signOut: jest.fn(async () => void steps.push('token removed')) } },
        { provide: Router, useValue: { navigateByUrl: jest.fn(async () => steps.push('navigated') > 0) } },
      ],
    })

    await TestBed.inject(AuthService).signOut()

    expect(steps).toEqual(['token removed', 'navigated'])
  })
})
