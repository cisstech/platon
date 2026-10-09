import { SIGN_IN_PARAMS, signInFailureUrl, signInUrl } from './sign-in-url'

const token = { accessToken: 'access.token', refreshToken: 'refresh.token' }

describe('signInUrl', () => {
  it('should hand the tokens and the encoded next address to the sign-in page', () => {
    expect(signInUrl(token, '/courses?tab=a&b=c')).toBe(
      '/login?access-token=access.token&refresh-token=refresh.token&next=%2Fcourses%3Ftab%3Da%26b%3Dc'
    )
  })

  it('should leave the next address out when there is none', () => {
    expect(signInUrl(token)).toBe('/login?access-token=access.token&refresh-token=refresh.token')
    expect(signInUrl(token, '')).toBe('/login?access-token=access.token&refresh-token=refresh.token')
  })
})

describe('signInFailureUrl', () => {
  it('should bring back to the sign-in page with the failure and the next address', () => {
    expect(signInFailureUrl('cas', '/courses/1')).toBe('/login?error=cas&next=%2Fcourses%2F1')
    expect(signInFailureUrl('cas')).toBe('/login?error=cas')
  })

  it('should name its parameters as the sign-in page reads them', () => {
    expect(SIGN_IN_PARAMS).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      next: 'next',
      error: 'error',
    })
  })
})
