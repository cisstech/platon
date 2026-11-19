import { CourseHue, courseHue, DueTone, IconName, TagTone } from '@platon/design-system'
import { isOpenWithoutDates, TaughtActivity } from '@platon/feature/course/common'
import { gradedTag, iconOf } from '../../../shared/activity-row'
import { copiesCount } from '../../../shared/copies'
import { byDeadline, closingDue, DAY, DueView, openingDue } from '../../../shared/due'
import { listOf } from '../../../shared/list-of'
import { plural } from '../../../shared/plural'
import { monitorOf, participation, runningDue, settingsOf } from '../../../shared/taught-activity'
import { closedOn, detailOf } from '../course.vm'

/** The row of an activity for its teacher: the row opens its monitoring, its menu what else to do. */
export interface TeacherRowView {
  readonly id: string
  readonly heading: string
  readonly icon: IconName
  readonly hue: CourseHue
  readonly status: string
  readonly statusTone: TagTone
  readonly statusIcon: IconName
  readonly due?: string
  readonly dueTone: DueTone
  readonly dueIcon?: IconName
  readonly detail?: string
  readonly tag?: string
  readonly tagIcon?: IconName
  readonly href: string
  /** Where to give dates to an open activity without any. */
  readonly plan?: string
  readonly menu: { readonly settings: string; readonly test: string; readonly resource?: string }
}

/** Its state with its glyph: planned, open, closed, or in correction while copies wait. */
const statusOf = (activity: TaughtActivity, now: Date, locale: string) => {
  if (activity.state === 'closed' && (activity.pendingCopies ?? 0) > 0) {
    return { status: 'En correction', statusTone: 'warning' as const, statusIcon: 'pending' as const }
  }
  if (activity.state === 'planned')
    return { status: 'Planifiée', statusTone: 'info' as const, statusIcon: 'event' as const }
  if (activity.state === 'opened') {
    return { status: 'Ouverte', statusTone: 'success' as const, statusIcon: 'event_available' as const }
  }
  return {
    status: closedOn(activity.closeAt, now, locale),
    statusTone: 'neutral' as const,
    statusIcon: 'event_busy' as const,
  }
}

/**
 * When it opens or closes, in words. An open activity without dates, its state already said: neutral
 * for a practice, a warning for one that counts, which opens to all without a time to take it.
 */
const teacherDue = (activity: TaughtActivity, now: Date, locale: string): Partial<DueView> => {
  const pending = activity.pendingCopies ?? 0
  if (activity.state === 'closed') {
    return pending > 0 ? { due: copiesCount(pending), dueTone: 'neutral' } : {}
  }
  if (activity.state === 'planned') {
    if (activity.openAt) return openingDue(activity.openAt, now, locale)
    return activity.restricted ? { due: 'Dates par période', dueTone: 'neutral' } : {}
  }
  if (isOpenWithoutDates(activity)) {
    return activity.graded
      ? { due: 'Sans dates', dueTone: 'warning', dueIcon: 'priority_high' }
      : { due: 'Sans dates', dueTone: 'neutral' }
  }
  return runningDue(activity, now, locale)
}

export const teacherRow = (activity: TaughtActivity, now: Date, locale: string): TeacherRowView => ({
  id: activity.id,
  heading: activity.title,
  icon: iconOf(activity),
  hue: courseHue(activity.courseId),
  ...statusOf(activity, now, locale),
  dueTone: 'neutral',
  ...teacherDue(activity, now, locale),
  detail: detailOf(activity, locale),
  ...gradedTag(activity),
  href: monitorOf(activity),
  plan: isOpenWithoutDates(activity) ? settingsOf(activity) : undefined,
  menu: {
    settings: settingsOf(activity),
    test: `/player/activity/${activity.id}`,
    resource: activity.resourceId ? `/resources/${activity.resourceId}` : undefined,
  },
})

/** An item of « À faire »: what to do, about what, and where to do it. */
export interface TodoView {
  readonly id: string
  readonly heading: string
  readonly detail: string
  readonly icon: IconName
  readonly tone: DueTone
  readonly href: string
  readonly queryParams?: Record<string, string>
}

/** « confiée à Julien Lefèvre », « confiées à Julien Lefèvre et Léa Fontaine »: who corrects the copies. */
const entrustedTo = (copies: number, correctors: string[] = []) =>
  correctors.length ? `, ${plural(copies, 'confiée', 'confiées')} à ${listOf(correctors)}` : ''

/** « Ouverte, sans dates. 23 étudiants l'ont déjà commencé. », or that no one has yet. */
const startedSoFar = (started: number) =>
  started > 0
    ? `${started} ${plural(started, "étudiant l'a", "étudiants l'ont")} déjà commencé.`
    : "Aucun étudiant ne l'a encore commencé."

/**
 * « À faire » of the teacher: the copies to correct of the whole course, by test, with its correctors;
 * the activities to plan; what closes within a day. Each item opens where to act.
 */
export const teacherTodo = (activities: TaughtActivity[], now: Date, locale: string): TodoView[] => {
  const copies = activities
    .filter((activity) => (activity.pendingCopies ?? 0) > 0)
    .map((activity): TodoView => {
      const pending = activity.pendingCopies ?? 0
      return {
        id: `copies-${activity.id}`,
        heading: copiesCount(pending),
        detail: `${activity.title}${entrustedTo(pending, activity.correctors)}`,
        icon: 'rate_review',
        tone: 'neutral',
        href: `/player/correction/${activity.courseId}`,
        queryParams: { activityId: activity.id },
      }
    })
  const plans = activities.filter(isOpenWithoutDates).map(
    (activity): TodoView => ({
      id: `plan-${activity.id}`,
      heading: `${activity.title} à planifier`,
      detail: `Ouverte, sans dates. ${startedSoFar(activity.startedCount)}`,
      icon: 'calendar_month',
      tone: 'neutral',
      href: settingsOf(activity),
    })
  )
  const closing = activities
    .filter(
      (activity) =>
        activity.state === 'opened' &&
        !!activity.closeAt &&
        activity.closeAt > now &&
        activity.closeAt.getTime() - now.getTime() < DAY
    )
    .sort(byDeadline)
    .map((activity): TodoView => {
      const due = closingDue(activity.closeAt as Date, now, locale)
      return {
        id: `closing-${activity.id}`,
        heading: due.due,
        detail: `${activity.title}, ${participation(activity)}`,
        icon: due.dueIcon ?? 'schedule',
        tone: due.dueTone,
        href: monitorOf(activity),
      }
    })
  return [...copies, ...plans, ...closing]
}
