import { isOnDisplay, readAnnouncementStats, writeAnnouncementStats } from './announcement-display'

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

describe('announcement stats', () => {
  beforeEach(() => localStorage.clear())

  it('keeps what this browser remembers of the announcements', () => {
    writeAnnouncementStats({
      n1: { announcementId: 'n1', firstShown: 1, lastShown: 1, timesShown: 1, dismissed: true, interacted: false },
    })

    expect(readAnnouncementStats()).toEqual({ n1: expect.objectContaining({ dismissed: true }) })
  })

  it('remembers nothing, without failing, when the storage is unusable or holds something else', () => {
    localStorage.setItem('platon-feature-announcements', '{not json')
    expect(readAnnouncementStats()).toEqual({})

    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(() => writeAnnouncementStats({})).not.toThrow()
    setItem.mockRestore()
  })
})
