import { durationText } from '@platon/design-system'
import { isLeftToDo, PlayableActivity } from '@platon/feature/course/common'
import { ActivityRowView, gradedTag, rowOf } from './activity-row'
import { byDeadline, byOpening, closingDue, DAY, DueView, openingDue } from './due'
import { plural } from './plural'

/** « Bientôt » looks this far ahead. */
const SOON_DAYS = 7

/** What a student does with an activity: start it, resume it, or see their results. */
export const actionOf = (activity: PlayableActivity): string => {
  if (activity.terminated) return 'Voir mes résultats'
  return activity.started ? 'Reprendre' : 'Commencer'
}

/** How far their copy has gone, in exercises: « 5 sur 6 ». */
export const progressOf = (activity: PlayableActivity) =>
  activity.exerciseCount > 0
    ? {
        progressText: `${activity.exercisesDone} sur ${activity.exerciseCount}`,
        progressHint: plural(activity.exerciseCount, 'exercice fait', 'exercices faits'),
      }
    : {}

/** « 45 min, une tentative »: the limits an activity that counts sets. */
export const limitsOf = (
  activity: Pick<PlayableActivity, 'duration' | 'attempts'>,
  locale: string
): string | undefined => {
  const limits = [
    activity.duration ? durationText(activity.duration, locale) : undefined,
    activity.attempts ? plural(activity.attempts, 'une tentative', `${activity.attempts} tentatives`) : undefined,
  ].filter(Boolean)

  return limits.length ? limits.join(', ') : undefined
}

/** When an activity to do closes, a warning within 24 h, or that it never does. */
const todoDue = (activity: PlayableActivity, now: Date, locale: string): DueView =>
  activity.closeAt ? closingDue(activity.closeAt, now, locale) : { due: 'Sans échéance', dueTone: 'neutral' }

/** A planned activity that opens within seven days. */
const opensSoon = (activity: PlayableActivity, now: Date) =>
  activity.state === 'planned' && !!activity.openAt && activity.openAt.getTime() - now.getTime() <= SOON_DAYS * DAY

/**
 * « À faire »: the open activities by deadline, those without one after. The first one left to do
 * carries its action on a button; a deadline within 24 h is a warning; one that counts says so, with
 * its limits.
 */
export const todoRows = (activities: PlayableActivity[], now: Date, locale: string): ActivityRowView[] => {
  const open = activities.filter((activity) => activity.state === 'opened').sort(byDeadline)
  const first = open.find(isLeftToDo)

  return open.map((activity) => ({
    ...rowOf(activity),
    ...todoDue(activity, now, locale),
    detail: activity.graded ? limitsOf(activity, locale) : undefined,
    done: activity.exercisesDone,
    total: activity.exerciseCount,
    ...progressOf(activity),
    ...gradedTag(activity),
    action: actionOf(activity),
    href: `/player/activity/${activity.id}`,
    button: activity === first ? ('primary' as const) : undefined,
  }))
}

/** « Bientôt »: what opens within seven days, so that a graded test does not come as a surprise. */
export const soonRows = (activities: PlayableActivity[], now: Date, locale: string): ActivityRowView[] =>
  activities
    .filter((activity) => opensSoon(activity, now))
    .sort(byOpening)
    .map((activity) => ({
      ...rowOf(activity),
      ...openingDue(activity.openAt as Date, now, locale),
      detail: activity.graded ? limitsOf(activity, locale) : undefined,
      done: 0,
      total: 0,
      ...gradedTag(activity),
      action: 'Lire les règles',
      href: `/player/activity/${activity.id}`,
    }))
