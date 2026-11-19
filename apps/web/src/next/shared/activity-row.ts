import { CourseHue, courseHue, IconName } from '@platon/design-system'
import { DueView } from './due'

/** A row of an activity, as `pl-activity-row` shows it. */
export interface ActivityRowView extends DueView {
  readonly id: string
  readonly heading: string
  /** Its course, where the screen lists activities of several. */
  readonly context?: string
  readonly icon: IconName
  readonly hue: CourseHue
  readonly detail?: string
  readonly done: number
  readonly total: number
  readonly progressText?: string
  readonly progressHint?: string
  readonly tag?: string
  readonly tagIcon?: IconName
  /** What to do, written out; without, the row only opens. */
  readonly action?: string
  readonly href: string
  readonly queryParams?: Record<string, string>
  /** The action as a button: `primary` for the one thing to do first. */
  readonly button?: 'primary' | 'secondary'
}

/** The icon of an activity: a challenge, one that counts in the grades, or any other. */
export const iconOf = (activity: { isChallenge: boolean; graded?: boolean }): IconName => {
  if (activity.isChallenge) return 'emoji_events'
  return activity.graded ? 'history_edu' : 'assignment'
}

/** What a row of an activity says first: its title, its course, its icon and the hue of its course. */
export const rowOf = (activity: {
  id: string
  title: string
  courseId: string
  courseName: string
  isChallenge: boolean
  graded?: boolean
}) => ({
  id: activity.id,
  heading: activity.title,
  context: activity.courseName,
  icon: iconOf(activity),
  hue: courseHue(activity.courseId),
})

/** « Notée », on an activity that counts in the grades, open or not. */
export const gradedTag = (activity: { graded?: boolean }) =>
  activity.graded ? { tag: 'Notée', tagIcon: 'grading' as const } : {}
