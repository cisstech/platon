import { User } from '@platon/core/common'
import { bannerAnnouncement } from '@platon/feature/announcement/browser/shared'
import { Announcement } from '@platon/feature/announcement/common'
import { capitalize, longDate } from '@platon/design-system'
import { plural } from '../../shared/plural'

const COUNT_WORDS = ['Une', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix']

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
