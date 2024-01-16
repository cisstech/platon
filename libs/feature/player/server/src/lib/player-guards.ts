/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenResponse } from '@platon/core/common'
import { PlayerActivityVariables, PlayerNavigation } from '@platon/feature/player/common'
import { SessionEntity } from '@platon/feature/result/server'

/**
 * Ensures that user cannot have multiple sessions of the same exercise at the same time (in non composed navigation mode).
 *
 * Note :
 * Exercise preview session are not bound to an activity.
 *
 * @param exerciseSession An exercise session.
 * @returns An object containing the activitySession with it's navigation
 *  or `undefined` if the exercise is not bound to an activity.
 */
export const withMultiSessionGuard = (exerciseSession: SessionEntity) => {
  let activitySession: SessionEntity | undefined
  let activityNavigation: PlayerNavigation | undefined
  if (exerciseSession.parent) {
    activitySession = exerciseSession.parent as SessionEntity
    activitySession.activity = activitySession.activity ?? exerciseSession.activity

    const activityVariables = activitySession.variables as PlayerActivityVariables
    activityNavigation = activityVariables.navigation

    if (activityVariables.settings?.navigation?.mode === 'composed') {
      return { activitySession, activityNavigation }
    }

    if (typeof activityNavigation.current !== 'object' || activityNavigation.current.sessionId !== exerciseSession.id) {
      throw new ForbiddenResponse('This exercise is not the most recents opened, please reload your page.')
    }
  }
  return { activitySession, activityNavigation }
}
