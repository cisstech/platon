import {
  calendarDay,
  CourseHue,
  courseHue,
  durationText,
  IconName,
  NO_BREAK_SPACE,
  percentOf,
} from '@platon/design-system'
import { Course, courseProgress, isLeftToDo, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { progressText } from '../../../shared/progress-text'
import { HomeFigures } from '../data/home-api'
import { closesThisWeek, closingThisWeek, today } from '../home.vm'

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

/** The day, then, once the activities are known, how many of those left to do close this week. */
export const subtitle = (now: Date, locale: string, activities?: PlayableActivity[]): string => {
  const closing = closingThisWeek(
    (activities ?? []).filter((activity) => isLeftToDo(activity) && closesThisWeek(activity.closeAt, now)).length
  )
  return closing ? `${today(now, locale)} ${closing}.` : today(now, locale)
}

export const emptySubtitle = (now: Date, locale: string): string =>
  `${today(now, locale)} Votre espace est prêt, il n'attend plus que vos cours.`

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
