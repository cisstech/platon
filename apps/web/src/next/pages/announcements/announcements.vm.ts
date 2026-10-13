import { userDisplayName, UserRoles } from '@platon/core/common'
import { fullCalendarDay, IconName, NO_BREAK_SPACE } from '@platon/design-system'
import { Announcement, EditorOutputData } from '@platon/feature/announcement/common'
import { isUnread } from '@platon/feature/announcement/browser/shared'
import type { ContentState } from './data/announcements-store'

/** The kinds an administrator gives an announcement, under the names of their icons in the current interface. */
const KIND_ICONS: Record<string, IconName> = {
  notification: 'campaign',
  bell: 'notifications',
  'info-circle': 'info',
  tool: 'construction',
  calendar: 'event',
  warning: 'warning',
  bulb: 'auto_awesome',
}

/** The icon of an announcement, neutral like every other: it says its kind, not a state. */
export const announcementIcon = (announcement: Pick<Announcement, 'icon'>): IconName =>
  KIND_ICONS[announcement.icon ?? ''] ?? 'campaign'

/** An announcement of the list, as `pl-announcement-row` and `pl-announcement-disclosure` show it. */
export interface AnnouncementView {
  readonly id: string
  readonly heading: string
  readonly summary: string
  readonly date: Date
  readonly icon: IconName
  readonly unread: boolean
}

export const announcementView = (
  announcement: Announcement,
  read: ReadonlySet<string>,
  now: Date
): AnnouncementView => ({
  id: announcement.id,
  heading: announcement.title,
  summary: announcement.description,
  date: new Date(announcement.createdAt),
  icon: announcementIcon(announcement),
  unread: isUnread(announcement, read, now),
})

/** The roles an announcement may be meant for, in the order a sentence names them. */
const PUBLICS: [UserRoles, string][] = [
  [UserRoles.student, 'les étudiants'],
  [UserRoles.teacher, 'les enseignants'],
  [UserRoles.admin, 'les administrateurs'],
  [UserRoles.demo, 'les comptes de démonstration'],
  [UserRoles.candidate, 'les candidats'],
]

const CONJUNCTION = new Intl.ListFormat('fr-FR', { type: 'conjunction' })

/** Who it is for: « pour tout le monde » without a role, else « pour les étudiants et les enseignants ». */
export const audience = (roles?: UserRoles[]): string => {
  const named = PUBLICS.filter(([role]) => roles?.includes(role)).map(([, words]) => words)
  return named.length ? `pour ${CONJUNCTION.format(named)}` : 'pour tout le monde'
}

/** « Publiée le 25 septembre 2026 par Sophie Lambert, pour tout le monde »; without « par » once the account is gone. */
export const byline = (announcement: Announcement, locale: string): string => {
  const by = announcement.publisher ? ` par ${userDisplayName(announcement.publisher)}` : ''
  return `Publiée le ${fullCalendarDay(announcement.createdAt, locale)}${by}, ${audience(announcement.targetedRoles)}`
}

/**
 * The announcement the page opens on: the one the address names, « Lire l'annonce » of a banner;
 * else, on a wide screen where the content sits beside the list, the most recent unread one, or the
 * most recent. A narrow screen opens none.
 */
export const openedOnArrival = (
  announcements: Announcement[],
  highlight: string | undefined,
  read: ReadonlySet<string>,
  now: Date,
  wide: boolean
): string | undefined => {
  if (highlight && announcements.some(({ id }) => id === highlight)) return highlight
  if (!wide) return undefined
  return (announcements.find((announcement) => isUnread(announcement, read, now)) ?? announcements[0])?.id
}

/** The open announcement: what the list knows shows at once, its content once loaded. */
export interface DetailView {
  readonly id: string
  readonly heading: string
  readonly byline: string
  readonly status: ContentState['status']
  /** Its content, when it has some; else the page shows its summary. */
  readonly content?: EditorOutputData
  readonly summary: string
}

export const detailView = (
  listed: Announcement | undefined,
  state: ContentState | undefined,
  locale: string
): DetailView | undefined => {
  const loaded = state?.status === 'ready' ? state.announcement : undefined
  const announcement = loaded ?? listed
  if (!announcement) return undefined
  return {
    id: announcement.id,
    heading: announcement.title,
    byline: byline(announcement, locale),
    status: state?.status ?? 'loading',
    summary: announcement.description,
    content: loaded?.data?.blocks?.length ? loaded.data : undefined,
  }
}

/** « Aucune annonce ne correspond à « examen ». » */
export const noMatch = (search: string) =>
  `Aucune annonce ne correspond à «${NO_BREAK_SPACE}${search}${NO_BREAK_SPACE}».`
