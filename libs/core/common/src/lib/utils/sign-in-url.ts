import { AuthToken } from '../models/auth.model'

/** The page of the web application that signs in. */
export const SIGN_IN_PATH = '/login'

/** The parameters the sign-in page reads, from a sign-in made elsewhere (CAS, LTI, an invitation). */
export const SIGN_IN_PARAMS = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  next: 'next',
  error: 'error',
} as const

/** The `error` of a sign-in page whose tokens were refused. */
export const SIGN_IN_TOKEN_REFUSED = 'token'

const toSignIn = (params: URLSearchParams, next?: string): string => {
  if (next) params.set(SIGN_IN_PARAMS.next, next)
  return `${SIGN_IN_PATH}?${params}`
}

/** Hands the tokens of a sign-in made elsewhere to the sign-in page, which then opens `next`. */
export const signInUrl = (token: AuthToken, next?: string): string =>
  toSignIn(
    new URLSearchParams({
      [SIGN_IN_PARAMS.accessToken]: token.accessToken,
      [SIGN_IN_PARAMS.refreshToken]: token.refreshToken,
    }),
    next
  )

/** Brings back to the sign-in page with a failure it explains, keeping `next` for after. */
export const signInFailureUrl = (error: string, next?: string): string =>
  toSignIn(new URLSearchParams({ [SIGN_IN_PARAMS.error]: error }), next)
