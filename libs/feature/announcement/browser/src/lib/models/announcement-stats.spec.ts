import { readAnnouncementStats, writeAnnouncementStats } from './announcement-stats'

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
