import { Announcement } from '@platon/feature/announcement/common'
import { MS_PER_DAY, TOTAL_PERIOD_DAYS } from './data-storage.model'

/**
 * Whether an announcement is still shown: until its display end, for its display duration after its
 * creation, or ten days after its creation when it sets neither.
 */
export const isOnDisplay = (
  announcement: Pick<Announcement, 'createdAt' | 'displayUntil' | 'displayDurationInDays'>,
  now = new Date()
): boolean => {
  const created = announcement.createdAt ? new Date(announcement.createdAt).getTime() : undefined
  const after = (days: number) => created !== undefined && now.getTime() > created + days * MS_PER_DAY

  if (announcement.displayUntil && now > new Date(announcement.displayUntil)) return false
  if (announcement.displayDurationInDays) return !after(announcement.displayDurationInDays)
  return announcement.displayUntil ? true : !after(TOTAL_PERIOD_DAYS)
}

/** The kind « Maintenance » speaks of the availability of the service. */
export const isServiceAnnouncement = (announcement: Pick<Announcement, 'icon'>) => announcement.icon === 'tool'

/**
 * Unread: still on display, and neither opened nor closed in a banner by the person, as the server
 * says or during this visit (`read`). Past its window, an announcement is never unread.
 */
export const isUnread = (announcement: Announcement, read: ReadonlySet<string>, now: Date) =>
  isOnDisplay(announcement, now) && !announcement.readAt && !read.has(announcement.id)

const createdAt = (announcement: Announcement) => new Date(announcement.createdAt).getTime()

/** The announcement of a banner: an unread one, about the service before any other, then the most recent. */
export const bannerAnnouncement = (
  announcements: Announcement[],
  read: ReadonlySet<string>,
  now: Date
): Announcement | undefined =>
  announcements
    .filter((announcement) => isUnread(announcement, read, now))
    .sort(
      (a, b) => Number(isServiceAnnouncement(b)) - Number(isServiceAnnouncement(a)) || createdAt(b) - createdAt(a)
    )[0]
