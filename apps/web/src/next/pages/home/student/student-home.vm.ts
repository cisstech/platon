import {
  calendarDay,
  CourseHue,
  courseHue,
  durationText,
  IconName,
  NO_BREAK_SPACE,
  percentOf,
} from '@platon/design-system'
import { Course, courseProgress, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { byDeadline, byOpening, closingDue, DAY, DueView, openingDue } from '../../../shared/due'
import { plural } from '../../../shared/plural'
import { progressText } from '../../../shared/progress-text'
import { HomeFigures } from '../data/home-api'
import { ActivityRowView, closesThisWeek, closingThisWeek, gradedTag, rowOf, today } from '../home.vm'

/** « Bientôt » looks this far ahead. */
const SOON_DAYS = 7

/** A copy of « Résultats récents », as `pl-copy-card` shows it. */
export interface CopyView {
  readonly id: string
  readonly heading: string
  readonly context: string
  readonly hue: CourseHue
  readonly date: string
  readonly grade?: number
  readonly gradeLabel?: string
  readonly state?: string
  readonly stateIcon?: IconName
  readonly action?: string
  readonly actionIcon?: IconName
  readonly href?: string
}

/** A course of « Mes cours », with its progress counted in exercises. */
export interface CourseView {
  readonly id: string
  readonly name: string
  readonly hue: CourseHue
  readonly done: number
  readonly total: number
  readonly percent: number
  readonly finished: boolean
  readonly progressText: string
  readonly href: string
}

export interface FigureView {
  readonly label: string
  readonly value: string
  readonly unit?: string
}

const isLeftToDo = (activity: PlayableActivity) => activity.state === 'opened' && !activity.terminated

/** The day, then, once the activities are known, how many of those left to do close this week. */
export const subtitle = (now: Date, locale: string, activities?: PlayableActivity[]): string => {
  const closing = closingThisWeek(
    (activities ?? []).filter((activity) => isLeftToDo(activity) && closesThisWeek(activity.closeAt, now)).length
  )
  return closing ? `${today(now, locale)} ${closing}.` : today(now, locale)
}

export const emptySubtitle = (now: Date, locale: string): string =>
  `${today(now, locale)} Votre espace est prêt, il n'attend plus que vos cours.`

const actionOf = (activity: PlayableActivity): string => {
  if (activity.terminated) return 'Voir mes résultats'
  return activity.started ? 'Reprendre' : 'Commencer'
}

const progressOf = (activity: PlayableActivity) =>
  activity.exerciseCount > 0
    ? {
        progressText: `${activity.exercisesDone} sur ${activity.exerciseCount}`,
        progressHint: plural(activity.exerciseCount, 'exercice fait', 'exercices faits'),
      }
    : {}

/** « 45 min, une tentative »: the limits an activity that counts sets. */
const limitsOf = (activity: PlayableActivity, locale: string): string | undefined => {
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

/**
 * « Résultats récents »: a graded copy writes its grade in the margin and opens its correction; one
 * being corrected says so; one whose activity hides the correction says nothing of it.
 */
export const copyViews = (copies: RecentCopy[], now: Date, locale: string): CopyView[] =>
  copies.map((copy) => {
    const base = {
      id: copy.sessionId,
      heading: copy.activityTitle,
      context: copy.courseName,
      hue: courseHue(copy.courseId),
      date: `Rendue le ${calendarDay(copy.terminatedAt, locale, now)}`,
    }
    if (copy.status === 'graded') {
      const grade = Math.round(copy.grade ?? 0)
      return {
        ...base,
        grade,
        gradeLabel: `${grade} sur 100`,
        action: 'Voir la correction',
        actionIcon: 'rate_review' as const,
        href: `/player/activity/${copy.activityId}`,
      }
    }
    return copy.status === 'correcting' ? { ...base, state: 'En correction', stateIcon: 'pending' as const } : base
  })

/** « Mes cours »: each course with its exercises done over all its activities. */
export const courseViews = (courses: Course[], activities: PlayableActivity[]): CourseView[] =>
  courses.map((course) => {
    const progress = courseProgress(course.id, activities)
    const { done, total, finished } = progress
    return {
      id: course.id,
      name: course.name,
      hue: courseHue(course.id),
      done,
      total,
      percent: percentOf(done, total),
      finished,
      progressText: progressText(progress),
      href: `/courses/${course.id}`,
    }
  })

/** The three figures over all courses: mean, success, time spent. */
export const figureViews = (figures: HomeFigures, locale: string): FigureView[] => [
  { label: 'Moyenne', value: String(Math.round(figures.averageScore)), unit: `/${NO_BREAK_SPACE}100` },
  {
    label: 'Réussite',
    value: new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(
      figures.successRate / 100
    ),
  },
  { label: 'Temps passé', value: durationText(figures.timeSpent, locale) },
]
