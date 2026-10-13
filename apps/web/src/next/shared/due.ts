import { DueTone, IconName, NO_BREAK_SPACE, upcomingTime } from '@platon/design-system'

export const DAY = 24 * 3600 * 1000

/** A deadline in words, its tone and its icon, as `pl-activity-row` shows it. */
export interface DueView {
  readonly due: string
  readonly dueTone: DueTone
  readonly dueIcon?: IconName
}

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

/** « Quiz : ferme demain à 9 h » with a subject, « Ferme demain à 9 h » without. */
const dueText = (verb: string, date: Date, now: Date, locale: string, subject?: string) =>
  subject
    ? `${subject}${NO_BREAK_SPACE}: ${when(verb.toLowerCase(), date, now, locale)}`
    : when(verb, date, now, locale)

/** When an open activity closes, a warning within 24 h; `subject` names it first. */
export const closingDue = (closeAt: Date, now: Date, locale: string, subject?: string): DueView => ({
  due: dueText('Ferme', closeAt, now, locale, subject),
  dueTone: closeAt.getTime() - now.getTime() < DAY ? 'warning' : 'neutral',
  dueIcon: 'schedule',
})

/** When a planned activity opens; `subject` names it first. */
export const openingDue = (openAt: Date, now: Date, locale: string, subject?: string): DueView => ({
  due: dueText('Ouvre', openAt, now, locale, subject),
  dueTone: 'info',
  dueIcon: 'event',
})

/** By deadline, those without one last, then by title. */
export const byDeadline = <T extends { closeAt?: Date | null; title: string }>(a: T, b: T) => {
  const deadline = (activity: T) => activity.closeAt?.getTime() ?? Number.POSITIVE_INFINITY
  return deadline(a) - deadline(b) || a.title.localeCompare(b.title)
}

/** By opening, the soonest first. */
export const byOpening = <T extends { openAt?: Date | null }>(a: T, b: T) =>
  (a.openAt?.getTime() ?? 0) - (b.openAt?.getTime() ?? 0)
