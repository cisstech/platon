import { Announcement } from '@platon/feature/announcement/common'
import { AnnouncementDisplayStats, MS_PER_DAY, STORAGE_KEY, TOTAL_PERIOD_DAYS } from './data-storage.model'

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

/** What this browser remembers of the announcements shown to its person, empty when it cannot read it. */
export const readAnnouncementStats = (): Record<string, AnnouncementDisplayStats> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/** Keeps what this browser remembers of the announcements; a storage it cannot write keeps nothing. */
export const writeAnnouncementStats = (stats: Record<string, AnnouncementDisplayStats>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    return
  }
}

/** The stats of one announcement, those of an announcement never shown when the browser has none. */
export const announcementStatsOf = (
  stats: Record<string, AnnouncementDisplayStats>,
  announcementId: string
): AnnouncementDisplayStats =>
  stats[announcementId] ?? {
    announcementId,
    firstShown: 0,
    lastShown: 0,
    timesShown: 0,
    dismissed: false,
    interacted: false,
  }
