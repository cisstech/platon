import { TaughtActivity } from '@platon/feature/course/common'
import { closingDue, DueView } from './due'
import { plural } from './plural'

/** Where its settings are: its page in the current interface. */
export const settingsOf = (activity: Pick<TaughtActivity, 'id' | 'courseId'>) =>
  `/activities/${activity.courseId}/${activity.id}`

/** Where its monitoring is: its page in the current interface. */
export const monitorOf = (activity: Pick<TaughtActivity, 'id' | 'courseId'>) =>
  `/activities/monitor/${activity.courseId}/${activity.id}`

/** When a running activity closes, or why it does not say: no deadline, or one per period. */
export const runningDue = (activity: TaughtActivity, now: Date, locale: string): DueView =>
  activity.closeAt
    ? closingDue(activity.closeAt, now, locale)
    : { due: activity.restricted ? 'Dates par période' : 'Sans fermeture', dueTone: 'neutral' }

/** « 251 sur 302 ont commencé », « 1 sur 302 participe ». */
export const participation = (activity: TaughtActivity): string => {
  const started = activity.startedCount
  const verb = activity.isChallenge
    ? plural(started, 'participe', 'participent')
    : plural(started, 'a commencé', 'ont commencé')

  return `${started} sur ${activity.studentCount} ${verb}`
}
