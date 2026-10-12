import { inject } from '@angular/core'
import { CanActivateFn, ParamMap, Router, UrlTree } from '@angular/router'
import { SIGN_IN_PARAMS, SIGN_IN_TOKEN_REFUSED, signInFailureUrl } from '@platon/core/common'
import { Connectivity } from '../../core/connectivity/connectivity'
import { legacyBridgeGuard } from '../../core/legacy-bridge/legacy-bridge-guard'
import { Session } from '../../core/session/session'
import { signInTarget } from './login.vm'

/** The `error` of a sign-in page the device came back to while offline. */
export const SIGN_IN_OFFLINE = 'offline'

/**
 * Before the sign-in page: the step of an external application (`callbackUrl`) stays in the current
 * interface; tokens in the address (LTI, CAS, an invitation) sign in and open `next`, leaving the
 * tokens out of the history; a person already signed in goes to `next` at once.
 */
export const loginGuard: CanActivateFn = (route, state) =>
  route.queryParamMap.has('callbackUrl')
    ? legacyBridgeGuard(route, state)
    : signInFirst(route.queryParamMap, inject(Session), inject(Router), inject(Connectivity).online())

const signInFirst = async (
  query: ParamMap,
  session: Session,
  router: Router,
  online: boolean
): Promise<boolean | UrlTree> => {
  const next = query.get(SIGN_IN_PARAMS.next) ?? undefined
  const target = router.parseUrl(signInTarget(next))
  const accessToken = query.get(SIGN_IN_PARAMS.accessToken)
  const refreshToken = query.get(SIGN_IN_PARAMS.refreshToken)

  if (accessToken && refreshToken) {
    // Offline, the tokens would be refused for nothing, and forgotten.
    if (!online) return router.parseUrl(signInFailureUrl(SIGN_IN_OFFLINE, next))
    try {
      await session.signInWithToken({ accessToken, refreshToken })
      return target
    } catch {
      return router.parseUrl(signInFailureUrl(SIGN_IN_TOKEN_REFUSED, next))
    }
  }
  return (await session.load()) ? target : true
}
