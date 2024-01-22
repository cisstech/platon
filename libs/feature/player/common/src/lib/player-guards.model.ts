/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenResponse, NotFoundResponse, User, deepMerge } from '@platon/core/common'
import {
  ActivitySettings,
  ExerciseFeedback,
  ExerciseHint,
  ExerciseTheory,
  ExerciseVariables,
} from '@platon/feature/compiler'
import { ActivitySession, Answer, AnswerStates, ExerciseSession, Session } from '@platon/feature/result/common'
import { PlayerActivityVariables, PlayerNavigation } from './player.model'

/**
 * Ensures that hints are not sent to the user if disabled in `settings` or not already asked by the user.
 * @param variables Exercise variables
 * @param settings Exercise settings.
 * @returns The hints to show to the user if applicable otherwise `undefined`.
 */
export const withHintGuard = (
  variables: ExerciseVariables,
  settings: ActivitySettings,
  answer?: Answer
): ExerciseHint | string[] | undefined => {
  let hint = variables.hint

  if (!hint || answer) {
    // disable hint button if there is not hint
    deepMerge(settings, { actions: { hints: false } })
  } else if (Array.isArray(hint) && hint.length === variables['.meta']?.consumedHints) {
    // disable hint button if all automatic hints are consumed
    deepMerge(settings, { actions: { hints: false } })
  } else if (hint && !Array.isArray(hint) && hint.done) {
    // disable hint button if hint.done is set by exercise script
    deepMerge(settings, { actions: { hints: false } })
  } else if (!settings.actions?.hints) {
    // disable hint if specified in settings
    hint = undefined
  }

  return hint
}

/**
 * Ensures that theory documents are not sent to the user if disabled in `settings`.
 * @param variables Exercise variables
 * @param settings Exercise settings.
 * @returns The theories to show to the user if applicable otherwise `undefined`.
 */
export const withTheoriesGuard = (
  variables: ExerciseVariables,
  settings: ActivitySettings,
  answer?: Answer
): ExerciseTheory[] | undefined => {
  let theories = variables.theories
  if (!answer && !settings.actions?.theories) {
    theories = []
  }
  return theories
}

/**
 * Ensures that solution is not sent to the user if disabled in `settings` or not already asked by the user.
 * @param variables Exercise variables
 * @param settings Exercise settings.
 * @returns The solution to show to the user if applicable otherwise `undefined`.
 */
export const withSolutionGuard = (
  variables: ExerciseVariables,
  settings: ActivitySettings,
  answer?: Answer
): string | undefined => {
  let solution = variables.solution
  if (!solution || answer) {
    deepMerge(settings, { actions: { solution: false } })
  }

  if (solution && !answer && (!settings?.actions?.solution || !variables['.meta']?.showSolution)) {
    solution = undefined
  }

  return solution
}

/**
 * Ensures that feedbacks are not sent to the user if disabled in `settings`.
 * @param variables Exercise variables
 * @param settings Exercise settings.
 * @returns The feedbacks to show to the user if applicable otherwise `undefined`.
 */
export const withFeedbacksGuard = (
  variables: ExerciseVariables,
  settings: ActivitySettings,
  answer?: Answer
): ExerciseFeedback[] | undefined => {
  const feedbacks = Array.isArray(variables.feedback)
    ? variables.feedback
    : variables.feedback
    ? [variables.feedback]
    : []

  const hideOnReview = answer && !settings?.feedback?.review
  const hideOnValidation = !answer && !settings?.feedback?.validation
  if (hideOnReview || hideOnValidation) {
    return []
  }

  return feedbacks
}

/**
 * Ensures that navigation feedbacks are not sent to the user if disabled in `settings`.
 * @param session An activity session.
 * @returns The session with feedback disabled if needed.
 */
export const withActivityFeedbacksGuard = <T extends object = PlayerActivityVariables>(
  session: Session
): Session<T> => {
  const variables = session.variables as PlayerActivityVariables

  const { settings, navigation } = variables

  const disable = () => {
    navigation.exercises.forEach((exercise) => {
      return (exercise.state = ![AnswerStates.NOT_STARTED, AnswerStates.STARTED].includes(exercise.state)
        ? AnswerStates.ANSWERED
        : exercise.state)
    })
  }

  const { terminated } = navigation
  const feedback = settings?.feedback

  if ((terminated && !feedback?.review) || (!terminated && !feedback?.validation)) {
    disable()
  }

  return session
}

/**
 * Ensures that `user` has access to `session`.
 *
 * Note:
 *
 * Preview sessions are not bound to any user so an `undefined` value for `user` means that the session is a preview.
 *
 * @param session Session to check the user rights for.
 * @param user User for which to check the rights.
 * @returns The session.
 */
export const withSessionAccessGuard = <T extends Session>(session?: T | null, user?: User): T => {
  if (!session) {
    throw new NotFoundResponse(`PlayerSession not found.`)
  }

  if (session.userId && session.userId !== user?.id) {
    throw new ForbiddenResponse('You cannot access to this session.')
  }

  return session
}

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
export const withMultiSessionGuard = (exerciseSession: ExerciseSession) => {
  let activitySession: ActivitySession | undefined
  let activityNavigation: PlayerNavigation | undefined
  if (exerciseSession.parent) {
    activitySession = exerciseSession.parent
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
