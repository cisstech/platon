import { AnnouncementDisplayStats, STORAGE_KEY } from './data-storage.model'

// What the window of the current interface remembers, per browser, of the announcements it showed.

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
