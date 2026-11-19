import { User, UserRoles } from '@platon/core/common'
import { Announcement } from '@platon/feature/announcement/common'
import { banner, greeting, welcome } from './home.vm'

const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)

const user = (values: Partial<User> = {}) =>
  ({ id: 'u1', username: 'ibenali', role: UserRoles.student, firstName: 'Inès', ...values } as User)

describe('greeting and welcome', () => {
  it('greet the person by their first name, else by their username', () => {
    expect(greeting(user())).toBe('Bonjour Inès')
    expect(welcome(user())).toBe('Bienvenue sur PLaTon, Inès')
    expect(greeting(user({ firstName: '  ' }))).toBe('Bonjour ibenali')
  })
})

describe('banner', () => {
  const announcement = (id: string, createdAt: Date, values: Partial<Announcement> = {}) =>
    ({ id, title: `Annonce ${id}`, description: 'Texte', createdAt, active: true, ...values } as Announcement)

  it('shows an unread announcement on display, about the service before any other, then the most recent', () => {
    const list = [
      announcement('old', at(20, 8, 0)),
      announcement('recent', at(27, 8, 0)),
      announcement('service', at(26, 8, 0), { icon: 'tool' }),
      announcement('read', at(28, 8, 0), { readAt: at(28, 9, 0) }),
      announcement('expired', at(28, 8, 0), { displayUntil: at(28, 9, 0) }),
    ]

    expect(banner(list, new Set(), NOW)).toEqual({ id: 'service', title: 'Annonce service', description: 'Texte' })
    expect(banner(list, new Set(['service']), NOW)?.id).toBe('recent')
  })

  it('shows nothing when no announcement is left', () => {
    expect(banner([announcement('closed', at(28, 8, 0))], new Set(['closed']), NOW)).toBeUndefined()
  })
})
