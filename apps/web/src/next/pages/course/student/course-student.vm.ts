import { courseHue, durationText, percentOf } from '@platon/design-system'
import { Course, courseProgress, CourseSection, PlayableActivity } from '@platon/feature/course/common'
import { ActivityRowView, gradedTag, iconOf } from '../../../shared/activity-row'
import { gradeOn100 } from '../../../shared/copies'
import { closingDue, DueView, openingDue } from '../../../shared/due'
import { actionOf, progressOf, soonRows, todoRows } from '../../../shared/playable-activity'
import { progressLine } from '../../../shared/progress-text'
import { closedOn, detailOf } from '../course.vm'

/** When it opens or closes for the student: « Sans échéance » for an open one that never closes. */
const studentDue = (activity: PlayableActivity, now: Date, locale: string): DueView => {
  if (activity.state === 'planned') {
    return activity.openAt ? openingDue(activity.openAt, now, locale) : { due: '', dueTone: 'neutral' }
  }
  if (activity.state === 'closed') return { due: closedOn(activity.closeAt, now, locale), dueTone: 'neutral' }
  return activity.closeAt ? closingDue(activity.closeAt, now, locale) : { due: 'Sans échéance', dueTone: 'neutral' }
}

/** How far the student has gone: their grade or its correction once handed in, else their exercises. */
const studentProgress = (activity: PlayableActivity) => {
  if (activity.state === 'planned') return { progressText: 'Pas encore ouverte', done: 0, total: 0 }
  if (activity.correcting) return { progressText: 'Copie en correction', done: 0, total: 0 }
  if (activity.grade !== undefined) return { progressText: gradeOn100(activity.grade), done: 0, total: 0 }
  return { done: activity.exercisesDone, total: activity.exerciseCount, ...progressOf(activity) }
}

/** What the student does: start, resume or see their results; nothing before it opens or untouched once closed. */
const studentAction = (activity: PlayableActivity) => {
  if (activity.state === 'planned') return undefined
  if (activity.state === 'closed') return activity.started ? 'Voir mes résultats' : undefined
  return actionOf(activity)
}

/** The row of an activity for a student of the course: their progress and what to do. */
export const studentRow = (activity: PlayableActivity, now: Date, locale: string): ActivityRowView => {
  const action = studentAction(activity)
  return {
    id: activity.id,
    heading: activity.title,
    icon: iconOf(activity),
    hue: courseHue(activity.courseId),
    ...studentDue(activity, now, locale),
    detail: detailOf(activity, locale),
    ...studentProgress(activity),
    ...gradedTag(activity),
    action,
    button: action ? 'secondary' : undefined,
    href: `/player/activity/${activity.id}`,
  }
}

/** What the column of a student says: their progress in exercises, their time, and what to resume. */
export interface StudentPanelView {
  readonly done: number
  readonly total: number
  readonly percent: number
  readonly finished: boolean
  readonly progressLine: string
  /** « 9 h 40 min passées », once they spent some. */
  readonly time?: string
  /** The activity left to do that closes first, with its action. */
  readonly resume?: ActivityRowView
}

export const studentPanel = (
  course: Course,
  activities: PlayableActivity[],
  now: Date,
  locale: string
): StudentPanelView => {
  const progress = courseProgress(course.id, activities)
  const spent = course.statistic?.timeSpent ?? 0
  const first = todoRows(activities, now, locale).find((row) => row.button === 'primary')
  return {
    done: progress.done,
    total: progress.total,
    percent: percentOf(progress.done, progress.total),
    finished: progress.finished,
    progressLine: progressLine(progress),
    time: spent > 0 ? `${durationText(spent, locale)} passées` : undefined,
    resume: first ? { ...first, context: undefined } : undefined,
  }
}

/** The rows of a phone: each says its section rather than its course, the page being the course. */
const inSections = (rows: ActivityRowView[], activities: PlayableActivity[], sections: CourseSection[]) => {
  const names = new Map(sections.map((section) => [section.id, section.name]))
  const sectionOf = new Map(activities.map((activity) => [activity.id, names.get(activity.sectionId)]))
  return rows.map((row) => ({ ...row, context: sectionOf.get(row.id) }))
}

/** « À faire » on a phone: the open activities by deadline, each with its section. */
export const phoneTodo = (
  activities: PlayableActivity[],
  sections: CourseSection[],
  now: Date,
  locale: string
): ActivityRowView[] => inSections(todoRows(activities, now, locale), activities, sections)

/** « Bientôt » on a phone: what opens within seven days, each with its section. */
export const phoneSoon = (
  activities: PlayableActivity[],
  sections: CourseSection[],
  now: Date,
  locale: string
): ActivityRowView[] => inSections(soonRows(activities, now, locale), activities, sections)
