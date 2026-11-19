import { ParamMap, Params } from '@angular/router'
import { userDisplayName } from '@platon/core/common'
import {
  CourseHue,
  courseHue,
  IconName,
  monogram,
  NO_BREAK_SPACE,
  percentOf,
  shortCalendarDay,
} from '@platon/design-system'
import {
  activityDone,
  Course,
  CourseOrderings,
  CourseProgress,
  courseProgress,
  CourseStatistic,
  PlayableActivity,
} from '@platon/feature/course/common'
import { byDeadline, byOpening, closingDue, DueView, openingDue } from '../../shared/due'
import { plural } from '../../shared/plural'
import { progressText } from '../../shared/progress-text'
import { quoted } from '../../shared/quoted'

/** The courses shown: the person's own, those they archived, or, for an administrator, every one. */
export type CourseTab = 'current' | 'archived' | 'platform'

export interface CourseListFilters {
  readonly search: string
  readonly order: CourseOrderings
  /** In days, 0 for every period. */
  readonly period: number
  readonly tab: CourseTab
}

export const DEFAULT_FILTERS: CourseListFilters = {
  search: '',
  order: CourseOrderings.UPDATED_AT,
  period: 0,
  tab: 'current',
}

/** Each in its natural direction: the most recent first, names from A to Z. */
export const ORDERS: readonly { readonly value: CourseOrderings; readonly label: string }[] = [
  { value: CourseOrderings.UPDATED_AT, label: 'Mis à jour récemment' },
  { value: CourseOrderings.CREATED_AT, label: 'Créés récemment' },
  { value: CourseOrderings.NAME, label: 'Par nom' },
]

/** How far back the last update goes, in days. */
export const PERIODS: readonly { readonly value: number; readonly label: string }[] = [
  { value: 0, label: 'Toutes les périodes' },
  { value: 1, label: `Dernières 24${NO_BREAK_SPACE}h` },
  { value: 7, label: '7 derniers jours' },
  { value: 31, label: '31 derniers jours' },
  { value: 180, label: '6 derniers mois' },
  { value: 365, label: '12 derniers mois' },
]

const TABS: readonly CourseTab[] = ['current', 'archived', 'platform']

/** Whether two filters give the same lists of courses: the tab only chooses which one shows. */
export const sameLists = (a: CourseListFilters, b: CourseListFilters): boolean =>
  a.search === b.search && a.order === b.order && a.period === b.period

/** The filters of the address, with the names of the current interface; its direction gives way to the natural one. */
export const filtersFrom = (params: ParamMap): CourseListFilters => {
  const order = ORDERS.find(({ value }) => value === params.get('order'))?.value
  const period = PERIODS.find(({ value }) => String(value) === params.get('period'))?.value
  const tab = TABS.find((value) => value === params.get('tab'))
  return {
    search: params.get('q') ?? DEFAULT_FILTERS.search,
    order: order ?? DEFAULT_FILTERS.order,
    period: period ?? DEFAULT_FILTERS.period,
    tab: tab ?? DEFAULT_FILTERS.tab,
  }
}

/** The address of the filters: what differs from the default, nothing else. */
export const paramsOf = (filters: CourseListFilters): Params => ({
  q: filters.search || null,
  order: filters.order === DEFAULT_FILTERS.order ? null : filters.order,
  period: filters.period || null,
  tab: filters.tab === DEFAULT_FILTERS.tab ? null : filters.tab,
  direction: null,
})

/** A figure of the headcount, in full: « 302 étudiants ». */
export interface HeadcountView {
  readonly icon: IconName
  readonly value: number
  readonly label: string
}

export const headcount = (statistic?: CourseStatistic): HeadcountView[] =>
  statistic
    ? [
        {
          icon: 'person',
          value: statistic.teacherCount,
          label: plural(statistic.teacherCount, 'enseignant', 'enseignants'),
        },
        {
          icon: 'groups',
          value: statistic.studentCount,
          label: plural(statistic.studentCount, 'étudiant', 'étudiants'),
        },
        {
          icon: 'widgets',
          value: statistic.activityCount,
          label: plural(statistic.activityCount, 'activité', 'activités'),
        },
      ]
    : []

/** « 1 challenge », « 3 challenges », nothing without any. */
export const challengesBadge = (count?: number): string | undefined =>
  count ? `${count} ${plural(count, 'challenge', 'challenges')}` : undefined

/** « Karim Haddad et 5 autres enseignants »: who is responsible, then how many others teach. */
export const teachersLine = (course: Course): string => {
  const count = course.statistic?.teacherCount ?? 1
  if (!course.owner) return `${count} ${plural(count, 'enseignant', 'enseignants')}`
  const others = count - 1
  const name = userDisplayName(course.owner)
  return others > 0 ? `${name} et ${others} ${plural(others, 'autre enseignant', 'autres enseignants')}` : name
}

/** « 34 exercices sur 59, 4 activités terminées sur 9 », or « Cours terminé, 4 activités sur 4 ». */
export const progressLine = (progress: CourseProgress): string => {
  const { total, finished, activitiesDone, activityCount } = progress
  if (!total) return progressText(progress)
  const activities = finished
    ? plural(activitiesDone, 'activité', 'activités')
    : plural(activitiesDone, 'activité terminée', 'activités terminées')
  return `${progressText(progress)}, ${activitiesDone} ${activities} sur${NO_BREAK_SPACE}${activityCount}`
}

/**
 * The next deadline of a student in a course, among what is left to do: the activity that closes
 * first, a warning within a day; else the one that opens next; else none ahead.
 */
export const nextDue = (courseId: string, activities: PlayableActivity[], now: Date, locale: string): DueView => {
  const left = activities.filter((activity) => activity.courseId === courseId && !activityDone(activity))
  const [closing] = left
    .filter((activity) => activity.state === 'opened' && !!activity.closeAt && activity.closeAt > now)
    .sort(byDeadline)
  if (closing?.closeAt) return closingDue(closing.closeAt, now, locale, closing.title)
  const [opening] = left
    .filter((activity) => activity.state === 'planned' && !!activity.openAt && activity.openAt > now)
    .sort(byOpening)
  if (opening?.openAt) return openingDue(opening.openAt, now, locale, opening.title)
  return { due: 'Aucune échéance à venir', dueTone: 'neutral' }
}

/** A course as its binder shows it: what every one says, then what a teacher or a student reads at its foot. */
export interface CourseCardView {
  readonly id: string
  readonly heading: string
  readonly description?: string
  readonly monogram: string
  readonly hue: CourseHue
  readonly href: string
  readonly badge?: string
  readonly badgeHref?: string
  /** The person may archive it for themselves. */
  readonly archivable: boolean
  readonly kind: 'teacher' | 'student'
  readonly counts?: HeadcountView[]
  /** The day of the last update: « 26 sept. ». */
  readonly updated?: string
  readonly progress?: CourseProgress
  /** The progress in exercises, in percent. */
  readonly percent?: number
  readonly progressText?: string
  readonly teachers?: string
  readonly due?: DueView
}

const cardOf = (course: Course) => {
  const badge = challengesBadge(course.statistic?.challengeCount)
  return {
    id: course.id,
    heading: course.name,
    description: course.desc || undefined,
    monogram: monogram(course.name),
    hue: courseHue(course.id),
    href: `/courses/${course.id}`,
    badge,
    badgeHref: badge ? `/courses/${course.id}/challenges` : undefined,
    archivable: !!course.permissions?.archive,
  }
}

/** For a teacher or an administrator: the headcount and the day of the last update. */
export const teacherCard = (course: Course, locale: string): CourseCardView => ({
  ...cardOf(course),
  kind: 'teacher',
  counts: headcount(course.statistic),
  updated: shortCalendarDay(course.updatedAt, locale),
})

/**
 * For a student: their progress, who teaches and their next deadline, never the headcount. Without
 * `activities`, for a course they archived, only who teaches.
 */
export const studentCard = (
  course: Course,
  activities: PlayableActivity[] | undefined,
  now: Date,
  locale: string
): CourseCardView => {
  const progress = activities ? courseProgress(course.id, activities) : undefined
  return {
    ...cardOf(course),
    kind: 'student',
    progress,
    percent: progress ? percentOf(progress.done, progress.total) : undefined,
    progressText: progress ? progressLine(progress) : undefined,
    teachers: teachersLine(course),
    due: activities ? nextDue(course.id, activities, now, locale) : undefined,
  }
}

/** The binders of a list: what the person reads of each course depends on their role. */
export interface CardContext {
  readonly tab: CourseTab
  readonly teaches: boolean
  /** The activities of a student in every course, once loaded. */
  readonly activities?: PlayableActivity[]
  /** The courses a student brought back, whose activities are on their way. */
  readonly missing: ReadonlySet<string>
  readonly now: Date
  readonly locale: string
}

export const cardViews = (courses: Course[], context: CardContext): CourseCardView[] =>
  courses.map((course) => {
    const { tab, activities, missing, now, locale } = context

    if (context.teaches) {
      const card = teacherCard(course, locale)
      // « Toute la plateforme » shows every course as it is: the person archives from their own lists.
      return tab === 'platform' ? { ...card, archivable: false } : card
    }

    // The activities of a student leave out the courses they archived, until one comes back.
    const known = tab === 'archived' || missing.has(course.id) ? undefined : activities
    return studentCard(course, known, now, locale)
  })

/** The lists answer a search or a period, not only the person's courses. */
export const isFiltered = ({ search, period }: Pick<CourseListFilters, 'search' | 'period'>): boolean =>
  !!search.trim() || period > 0

/** What a search or a period found nothing for, and what clears it. */
export interface NoMatchView {
  readonly heading: string
  readonly clear: string
}

/** « Aucun cours ne correspond à « algo ». », or that nothing was updated over the period, or both. */
export const noMatch = ({ search, period }: Pick<CourseListFilters, 'search' | 'period'>): NoMatchView => {
  const term = search.trim()
  if (!period) return { heading: `Aucun cours ne correspond à ${quoted(term)}.`, clear: 'Effacer la recherche' }
  if (!term) return { heading: 'Aucun cours mis à jour sur cette période.', clear: 'Voir toutes les périodes' }
  return { heading: `Aucun cours ne correspond à ${quoted(term)} sur cette période.`, clear: 'Effacer les filtres' }
}

/** What a search asks, its words and its period, in one text: two searches that ask the same are equal. */
export const asked = ({ search, period }: Pick<CourseListFilters, 'search' | 'period'>): string =>
  `${search.trim()} ${period}`

/** What a search found, as a screen reader says it: « 3 cours », or that none matches. */
export const searchOutcome = (count: number, filters: Pick<CourseListFilters, 'search' | 'period'>): string =>
  count ? `${count} cours` : noMatch(filters).heading
