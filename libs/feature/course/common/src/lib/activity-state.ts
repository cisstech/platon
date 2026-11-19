import { PlayableActivity, TaughtActivity } from './activity.model'

/** An open activity a student has not handed in yet. */
export const isLeftToDo = (activity: Pick<PlayableActivity, 'state' | 'terminated'>): boolean =>
  activity.state === 'opened' && !activity.terminated

/** An activity that follows its dates: it has some, or its restriction periods give them. */
export const followsDates = (activity: Pick<TaughtActivity, 'openAt' | 'closeAt' | 'restricted'>): boolean =>
  !!(activity.openAt || activity.closeAt || activity.restricted)

/** An open activity without dates: open to its students since it was added. */
export const isOpenWithoutDates = (
  activity: Pick<TaughtActivity, 'state' | 'openAt' | 'closeAt' | 'restricted'>
): boolean => activity.state === 'opened' && !followsDates(activity)
