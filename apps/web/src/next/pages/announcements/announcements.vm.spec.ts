import { User, UserRoles } from '@platon/core/common'
import { Announcement } from '@platon/feature/announcement/common'
import {
  announcementIcon,
  announcementView,
  audience,
  byline,
  detailView,
  noMatch,
  openedOnArrival,
} from './announcements.vm'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, month = 8, year = 2026) => new Date(year, month, day, 9)
const sophie = { id: 'u1', username: 'slambert', firstName: 'Sophie', lastName: 'Lambert' } as User
const announcement = (id: string, createdAt: Date, values: Partial<Announcement> = {}) =>
  ({
    id,
    title: `Annonce ${id}`,
    description: `Résumé ${id}`,
    createdAt,
    active: true,
    publisher: sophie,
    ...values,
  } as Announcement)

describe('announcementIcon', () => {
  it.each([
    ['notification', 'campaign'],
    ['bell', 'notifications'],
    ['info-circle', 'info'],
    ['tool', 'construction'],
    ['calendar', 'event'],
    ['warning', 'warning'],
    ['bulb', 'auto_awesome'],
    [undefined, 'campaign'],
    ['smile', 'campaign'],
  ])('shows the kind %s with the icon %s', (icon, expected) => {
    expect(announcementIcon({ icon })).toBe(expected)
  })
})

describe('announcementView', () => {
  it('gives a row its title, summary, day, the icon of its kind, and whether it is unread', () => {
    expect(announcementView(announcement('a', at(25), { icon: 'tool' }), new Set(), NOW)).toEqual({
      id: 'a',
      heading: 'Annonce a',
      summary: 'Résumé a',
      date: at(25),
      icon: 'construction',
      unread: true,
    })
  })

  it('says a row is read once opened during this visit', () => {
    expect(announcementView(announcement('a', at(25)), new Set(['a']), NOW).unread).toBe(false)
  })
})

describe('audience', () => {
  it.each([
    [undefined, 'pour tout le monde'],
    [[], 'pour tout le monde'],
    [[UserRoles.student], 'pour les étudiants'],
    [[UserRoles.teacher, UserRoles.student], 'pour les étudiants et les enseignants'],
    [
      [UserRoles.admin, UserRoles.demo, UserRoles.teacher],
      'pour les enseignants, les administrateurs et les comptes de démonstration',
    ],
    [[UserRoles.candidate], 'pour les candidats'],
  ])('says who %j is for: « %s »', (roles, expected) => {
    expect(audience(roles)).toBe(expected)
  })
})

describe('byline', () => {
  it('says when, by whom and for whom it was published', () => {
    expect(byline(announcement('a', at(25)), 'fr-FR')).toBe(
      'Publiée le 25 septembre 2026 par Sophie Lambert, pour tout le monde'
    )
  })

  it('names the publisher by their username without a full name, and leaves them out once their account is gone', () => {
    const anonymous = { ...sophie, lastName: '' }
    expect(byline(announcement('a', at(25), { publisher: anonymous }), 'fr-FR')).toBe(
      'Publiée le 25 septembre 2026 par slambert, pour tout le monde'
    )
    expect(
      byline(announcement('a', at(25), { publisher: undefined, targetedRoles: [UserRoles.student] }), 'fr-FR')
    ).toBe('Publiée le 25 septembre 2026, pour les étudiants')
  })
})

describe('openedOnArrival', () => {
  const list = [
    announcement('read', at(27), { readAt: at(27) }),
    announcement('unread', at(25)),
    announcement('old', at(10)),
  ]

  it('opens the announcement named by the address, on any screen', () => {
    expect(openedOnArrival(list, 'old', new Set(), NOW, false)).toBe('old')
    expect(openedOnArrival(list, 'old', new Set(), NOW, true)).toBe('old')
  })

  it('opens, on a wide screen, the most recent unread one, else the most recent', () => {
    expect(openedOnArrival(list, undefined, new Set(), NOW, true)).toBe('unread')
    expect(openedOnArrival(list, undefined, new Set(['unread']), NOW, true)).toBe('read')
  })

  it('opens none on a narrow screen, nor when the list is empty', () => {
    expect(openedOnArrival(list, undefined, new Set(), NOW, false)).toBeUndefined()
    expect(openedOnArrival([], undefined, new Set(), NOW, true)).toBeUndefined()
  })

  it('ignores an announcement named by the address that is not in the list', () => {
    expect(openedOnArrival(list, 'gone', new Set(), NOW, true)).toBe('unread')
    expect(openedOnArrival(list, 'gone', new Set(), NOW, false)).toBeUndefined()
  })
})

describe('detailView', () => {
  const blocks = { blocks: [{ type: 'paragraph', data: { text: 'Texte' } }] }

  it('shows what the list knows at once, its content once loaded', () => {
    const listed = announcement('a', at(25))

    expect(detailView(listed, { status: 'loading' }, 'fr-FR')).toEqual({
      id: 'a',
      heading: 'Annonce a',
      byline: 'Publiée le 25 septembre 2026 par Sophie Lambert, pour tout le monde',
      status: 'loading',
      summary: 'Résumé a',
      content: undefined,
    })
    expect(detailView(listed, { status: 'ready', announcement: { ...listed, data: blocks } }, 'fr-FR')).toMatchObject({
      status: 'ready',
      content: blocks,
    })
  })

  it('shows the summary of an announcement without content', () => {
    const listed = announcement('a', at(25))

    expect(
      detailView(listed, { status: 'ready', announcement: { ...listed, data: { blocks: [] } } }, 'fr-FR')?.content
    ).toBeUndefined()
  })

  it('shows an announcement absent from the list, once loaded', () => {
    const loaded = announcement('a', at(25))

    expect(detailView(undefined, { status: 'loading' }, 'fr-FR')).toBeUndefined()
    expect(detailView(undefined, { status: 'ready', announcement: loaded }, 'fr-FR')?.heading).toBe('Annonce a')
  })
})

describe('noMatch', () => {
  it('quotes the search that found nothing', () => {
    expect(noMatch('examen')).toBe('Aucune annonce ne correspond à « examen ».')
  })
})
