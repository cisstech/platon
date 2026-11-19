import { Announcement } from '@platon/feature/announcement/common'
import { bannerAnnouncement, isOnDisplay, isServiceAnnouncement, isUnread } from './announcement-display'

const NOW = new Date('2026-10-12T08:00:00Z')
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 3600 * 1000)

describe('isOnDisplay', () => {
  it('shows an announcement until its display end', () => {
    expect(isOnDisplay({ createdAt: daysAgo(30), displayUntil: daysAgo(-1) }, NOW)).toBe(true)
    expect(isOnDisplay({ createdAt: daysAgo(3), displayUntil: daysAgo(1) }, NOW)).toBe(false)
  })

  it('shows an announcement for its display duration after its creation', () => {
    expect(isOnDisplay({ createdAt: daysAgo(4), displayDurationInDays: 5 }, NOW)).toBe(true)
    expect(isOnDisplay({ createdAt: daysAgo(6), displayDurationInDays: 5 }, NOW)).toBe(false)
  })

  it('shows an announcement ten days after its creation when it says nothing else', () => {
    expect(isOnDisplay({ createdAt: daysAgo(9) }, NOW)).toBe(true)
    expect(isOnDisplay({ createdAt: daysAgo(11) }, NOW)).toBe(false)
  })
})

// A Monday afternoon, in the local time of the machine running the tests.
const AFTERNOON = new Date(2026, 8, 28, 14, 30)
const at = (day: number, month = 8) => new Date(2026, month, day, 9)
const announcement = (id: string, createdAt: Date, values: Partial<Announcement> = {}) =>
  ({ id, title: `Annonce ${id}`, description: 'Texte', createdAt, active: true, ...values } as Announcement)

describe('isServiceAnnouncement', () => {
  it('holds for the kind Maintenance only', () => {
    expect(isServiceAnnouncement({ icon: 'tool' })).toBe(true)
    expect(isServiceAnnouncement({ icon: 'warning' })).toBe(false)
    expect(isServiceAnnouncement({})).toBe(false)
  })
})

describe('isUnread', () => {
  it('holds for an announcement on display that the person has not read', () => {
    expect(isUnread(announcement('a', at(27)), new Set(), AFTERNOON)).toBe(true)
  })

  it('does not hold once read, on the server or during this visit', () => {
    expect(isUnread(announcement('a', at(27), { readAt: at(28) }), new Set(), AFTERNOON)).toBe(false)
    expect(isUnread(announcement('a', at(27)), new Set(['a']), AFTERNOON)).toBe(false)
  })

  it('never holds past the display window, read or not', () => {
    expect(isUnread(announcement('a', at(28, 7)), new Set(), AFTERNOON)).toBe(false)
  })
})

describe('bannerAnnouncement', () => {
  it('offers an announcement of the service before any other, then the most recent', () => {
    const list = [
      announcement('recent', at(27)),
      announcement('service', at(25), { icon: 'tool' }),
      announcement('older', at(20)),
    ]

    expect(bannerAnnouncement(list, new Set(), AFTERNOON)?.id).toBe('service')
    expect(bannerAnnouncement(list, new Set(['service']), AFTERNOON)?.id).toBe('recent')
  })

  it('offers only an unread one on display', () => {
    const list = [
      announcement('read', at(27), { readAt: at(27) }),
      announcement('expired', at(27), { displayUntil: at(28, 7) }),
    ]

    expect(bannerAnnouncement(list, new Set(), AFTERNOON)).toBeUndefined()
  })
})
