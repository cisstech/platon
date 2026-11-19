import { User } from '@platon/core/common'
import { bannerAnnouncement } from '@platon/feature/announcement/browser/shared'
import { Announcement } from '@platon/feature/announcement/common'
import {
  capitalize,
  CourseHue,
  courseHue,
  DueTone,
  IconName,
  longDate,
  NO_BREAK_SPACE,
  upcomingTime,
} from '@platon/design-system'
import { plural } from '../../shared/plural'

export const DAY = 24 * 3600 * 1000
const COUNT_WORDS = ['Une', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix']

/** A row of an activity, as `pl-activity-row` shows it. */
export interface ActivityRowView {
  readonly id: string
  readonly heading: string
  readonly context: string
  readonly icon: IconName
  readonly hue: CourseHue
  readonly due: string
  readonly dueTone: DueTone
  readonly dueIcon?: IconName
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

/** The deadline of a row, in words, its tone and its icon. */
export type DueView = Pick<ActivityRowView, 'due' | 'dueTone' | 'dueIcon'>

const firstNameOf = (user: User): string => user.firstName?.trim() || user.username

export const greeting = (user: User): string => `Bonjour ${firstNameOf(user)}`

export const welcome = (user: User): string => `Bienvenue sur PLaTon, ${firstNameOf(user)}`

/** « Lundi 28 septembre. » */
export const today = (now: Date, locale: string) => `${capitalize(longDate(now, locale, now), locale)}.`

/** The end of the week of `now`, Sunday at midnight: French weeks start on Monday. */
const endOfWeek = (now: Date) => {
  const daysToSunday = (7 - now.getDay()) % 7
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSunday + 1)
}

/** Whether a deadline falls before the end of the week of `now`. */
export const closesThisWeek = (closeAt: Date | null | undefined, now: Date): boolean =>
  !!closeAt && closeAt.getTime() < endOfWeek(now).getTime()

/** « Deux activités ferment cette semaine », or nothing when none does. */
export const closingThisWeek = (count: number): string | undefined =>
  count
    ? `${COUNT_WORDS[count - 1] ?? String(count)} ${plural(count, 'activité ferme', 'activités ferment')} cette semaine`
    : undefined

/** « Ferme ce soir à 23 h 59 », « Ouvre mercredi à 10 h », « Ouvre le lundi 12 octobre à 8 h ». */
export const when = (verb: string, date: Date, now: Date, locale: string): string => {
  const { day, date: on, time, evening } = upcomingTime(date, locale, now)
  const at = `à${NO_BREAK_SPACE}${time}`
  switch (day) {
    case 'today':
      return evening ? `${verb} ce soir ${at}` : `${verb} aujourd'hui ${at}`
    case 'tomorrow':
      return `${verb} demain ${at}`
    case 'week':
      return `${verb} ${on} ${at}`
    default:
      return `${verb} le ${on} ${at}`
  }
}

/** When an open activity closes, a warning within 24 h. */
export const closingDue = (closeAt: Date, now: Date, locale: string): DueView => ({
  due: when('Ferme', closeAt, now, locale),
  dueTone: closeAt.getTime() - now.getTime() < DAY ? 'warning' : 'neutral',
  dueIcon: 'schedule',
})

/** When a planned activity opens. */
export const openingDue = (openAt: Date, now: Date, locale: string): DueView => ({
  due: when('Ouvre', openAt, now, locale),
  dueTone: 'info',
  dueIcon: 'event',
})

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

/** By deadline, those without one last, then by title. */
export const byDeadline = <T extends { closeAt?: Date | null; title: string }>(a: T, b: T) => {
  const deadline = (activity: T) => activity.closeAt?.getTime() ?? Number.POSITIVE_INFINITY
  return deadline(a) - deadline(b) || a.title.localeCompare(b.title)
}

/** By opening, the soonest first. */
export const byOpening = <T extends { openAt?: Date | null }>(a: T, b: T) =>
  (a.openAt?.getTime() ?? 0) - (b.openAt?.getTime() ?? 0)

/** The announcement of the banner. */
export interface BannerView {
  readonly id: string
  readonly title: string
  readonly description: string
}

/** The banner: an unread announcement on display, about the service before any other, then the most recent. */
export const banner = (announcements: Announcement[], read: ReadonlySet<string>, now: Date): BannerView | undefined => {
  const shown = bannerAnnouncement(announcements, read, now)
  return shown ? { id: shown.id, title: shown.title, description: shown.description } : undefined
}
