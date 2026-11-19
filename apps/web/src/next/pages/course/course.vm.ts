import { userDisplayName } from '@platon/core/common'
import { calendarDay, IconName, PageCrumb, shortCalendarDay, withoutAccents } from '@platon/design-system'
import {
  activityDone,
  ActivityOpenStates,
  Course,
  CourseSection,
  PlayableActivity,
} from '@platon/feature/course/common'
import { headcount, teachersLine } from '../../shared/course-people'
import { byDeadline, when } from '../../shared/due'
import { limitsOf } from '../../shared/playable-activity'
import { plural } from '../../shared/plural'

/** The activities the overview shows: all of them, or those of one state. */
export type StateFilter = 'all' | ActivityOpenStates

export const STATE_FILTERS: readonly { readonly value: StateFilter; readonly label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'opened', label: 'Ouvertes' },
  { value: 'planned', label: 'Planifiées' },
  { value: 'closed', label: 'Fermées' },
]

export interface OverviewFilters {
  readonly search: string
  readonly state: StateFilter
}

/** Every activity, as the overview opens. */
export const NO_FILTERS: OverviewFilters = { search: '', state: 'all' }

/** Who may change a course reads it as its teacher, whatever their role on the platform. */
export const teaches = (course: Course): boolean => !!course.permissions?.update

/** A tab of the page of a course. */
export interface TabView {
  readonly label: string
  readonly icon: IconName
  readonly href: string
  readonly count?: number
}

/**
 * The tabs of a course: its overview and its challenges, if it has some; for its teacher, its members,
 * its groups and its settings. Only the overview is in this interface: the others go through its bridge.
 */
export const tabsOf = (course: Course, teacher: boolean): TabView[] => {
  const base = `/courses/${course.id}`
  const statistic = course.statistic
  const challenges = statistic?.challengeCount ?? 0
  const tabs: TabView[] = [{ label: "Vue d'ensemble", icon: 'grid_view', href: base }]
  if (challenges > 0)
    tabs.push({ label: 'Challenges', icon: 'emoji_events', href: `${base}/challenges`, count: challenges })
  if (!teacher) return tabs

  const members = statistic ? statistic.teacherCount + statistic.studentCount : undefined
  return [
    ...tabs,
    { label: 'Membres', icon: 'groups', href: `${base}/members`, count: members },
    { label: 'Groupes', icon: 'group_add', href: `${base}/groups` },
    { label: 'Paramètres', icon: 'settings', href: `${base}/settings` },
  ]
}

/** The way back to the list of courses, then the course. */
export const crumbsOf = (course: Course): PageCrumb[] => [{ label: 'Cours', link: '/courses' }, { label: course.name }]

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** « créé le 1er septembre par Karim Haddad »: French writes the first of a month « 1er ». */
export const createdLine = (course: Course, now: Date, locale: string): string => {
  const created = new Date(course.createdAt)
  const day = isSameDay(created, now) ? "aujourd'hui" : `le ${calendarDay(created, locale, now).replace(/^1 /, '1er ')}`
  return course.owner ? `créé ${day} par ${userDisplayName(course.owner)}` : `créé ${day}`
}

/**
 * « Prochaine échéance ce soir à 23 h 59 »: the open activity not done yet that closes first, as the
 * binder of the course says it; none without.
 */
export const nextDeadline = (activities: PlayableActivity[], now: Date, locale: string): string | undefined => {
  const [first] = activities
    .filter((activity) => activity.state === 'opened' && !activityDone(activity))
    .filter((activity) => !!activity.closeAt && activity.closeAt > now)
    .sort(byDeadline)
  return first?.closeAt ? when('Prochaine échéance', first.closeAt, now, locale) : undefined
}

/** A figure of the head of the page: a count, or a line about the course. */
export interface FigureView {
  readonly icon: IconName
  readonly value?: number
  readonly label: string
}

/**
 * What the head of the page says of the course: for its teacher, its headcount and when it was created,
 * by whom; for a student, who teaches it and their next deadline, never the headcount.
 */
export const figuresOf = (
  course: Course,
  teacher: boolean,
  activities: PlayableActivity[],
  now: Date,
  locale: string
): FigureView[] => {
  if (teacher) {
    const created: FigureView = { icon: 'history', label: createdLine(course, now, locale) }
    return [...headcount(course.statistic), created]
  }
  const deadline = nextDeadline(activities, now, locale)
  const teachers: FigureView = { icon: 'person', label: teachersLine(course, { responsible: true }) }
  return deadline ? [teachers, { icon: 'schedule', label: deadline }] : [teachers]
}

/** A section of the overview with the activities it shows. */
export interface GroupView<A> {
  readonly section: CourseSection
  readonly activities: A[]
}

const plain = (text: string) => withoutAccents(text).toLowerCase().trim()

/**
 * The activities by section, in the order the teacher gives both. A search keeps the activities whose
 * title matches, or all those of a section whose name does; a state keeps those of that state. Once
 * filtered, a section that keeps nothing goes; unfiltered, an empty section stays.
 */
export const grouped = <A extends { sectionId: string; order: number; title: string; state: ActivityOpenStates }>(
  sections: CourseSection[],
  activities: A[],
  filters: OverviewFilters
): GroupView<A>[] => {
  const term = plain(filters.search)
  const filtered = !!term || filters.state !== 'all'
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const named = !!term && plain(section.name).includes(term)
      const kept = activities
        .filter((activity) => activity.sectionId === section.id)
        .filter((activity) => filters.state === 'all' || activity.state === filters.state)
        .filter((activity) => !term || named || plain(activity.title).includes(term))
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
      return { section, activities: kept }
    })
    .filter(({ activities }) => !filtered || activities.length > 0)
}

/** « 8 exercices », nothing for an activity without any. */
const exercisesOf = (count: number) => (count > 0 ? `${count} ${plural(count, 'exercice', 'exercices')}` : undefined)

/** The limits of an activity that counts, then its exercises: « 1 h 30 min, une tentative, 8 exercices ». */
export const detailOf = (
  activity: Pick<PlayableActivity, 'graded' | 'duration' | 'attempts' | 'exerciseCount'>,
  locale: string
) =>
  [activity.graded ? limitsOf(activity, locale) : undefined, exercisesOf(activity.exerciseCount)]
    .filter(Boolean)
    .join(', ') || undefined

/** « Fermée le 21 sept. », or « Fermée » when it has no date. */
export const closedOn = (closeAt: Date | null | undefined, now: Date, locale: string) =>
  closeAt ? `Fermée le ${shortCalendarDay(closeAt, locale, now)}` : 'Fermée'

/** What a search or a state leaves, for screen readers: « 3 activités », or that nothing matches. */
export const filterOutcome = (groups: GroupView<unknown>[]): string => {
  const count = groups.reduce((sum, group) => sum + group.activities.length, 0)
  return count ? `${count} ${plural(count, 'activité', 'activités')}` : 'Aucune activité ne correspond'
}

/** « 3 activités », and for a student on a phone, what is left: « 3 activités, 2 à faire ». */
export const sectionSummary = (activities: { length: number }, left?: number): string => {
  const count = `${activities.length} ${plural(activities.length, 'activité', 'activités')}`
  return left === undefined ? count : left > 0 ? `${count}, ${left} à faire` : `${count}, rien à faire`
}

/** The links that open the course: in PLaTon, and from an LMS through LTI. */
export const shareLinks = (courseId: string, origin: string) => ({
  platon: `${origin}/courses/${courseId}`,
  lti: `${origin}/api/v1/lti/launch?next=/courses/${courseId}`,
})
