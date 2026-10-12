import { activityDatesFor, Restriction, RestrictionList, RestrictionSubject } from './activity-restriction.model'

const OPEN = new Date('2026-10-01T08:00:00Z')
const CLOSE = new Date('2026-10-31T22:00:00Z')

const dates = (start?: string, end?: string): Restriction => ({ type: 'DateRange', config: { start, end } as never })
const period = (...restriction: Restriction[]): RestrictionList => ({ restriction })
const members = (...ids: string[]): Restriction => ({ type: 'Members', config: { members: ids } })
const correctors = (...ids: string[]): Restriction => ({ type: 'Correctors', config: { correctors: ids } })
const groups = (...ids: string[]): Restriction => ({ type: 'Groups', config: { groups: ids } })
const others: Restriction = { type: 'Others', config: { enabled: true } }

const subject = (memberIds: string[] = [], groupIds: string[] = []): RestrictionSubject => ({
  userId: 'u1',
  memberIds: new Set(memberIds),
  groupIds: new Set(groupIds),
})

const restricted = (...restrictions: RestrictionList[]) => ({
  openAt: OPEN,
  closeAt: CLOSE,
  ignoreRestrictions: false,
  restrictions,
})

describe('activityDatesFor', () => {
  it('gives the activity dates when its restrictions are ignored', () => {
    const activity = { ...restricted(period(dates('2026-11-01'), members('m1'))), ignoreRestrictions: true }

    expect(activityDatesFor(activity, subject())).toEqual({ openAt: OPEN, closeAt: CLOSE })
  })

  it('gives the activity dates when it has no restriction, stored as an empty object or as null', () => {
    for (const restrictions of [[], {}, null]) {
      const activity = { openAt: OPEN, closeAt: null, ignoreRestrictions: false, restrictions } as never

      expect(activityDatesFor(activity, subject())).toEqual({ openAt: OPEN, closeAt: undefined })
    }
  })

  it('gives the dates of the period that names the person as a member', () => {
    const activity = restricted(period(dates('2026-11-01T08:00:00Z', '2026-11-02T08:00:00Z'), members('m1', 'm2')))

    expect(activityDatesFor(activity, subject(['m2']))).toEqual({
      openAt: new Date('2026-11-01T08:00:00Z'),
      closeAt: new Date('2026-11-02T08:00:00Z'),
    })
  })

  it('gives the dates of the period that names the person as a corrector', () => {
    const activity = restricted(period(dates('2026-11-01T08:00:00Z'), correctors('m1')))

    expect(activityDatesFor(activity, subject(['m1']))).toEqual({ openAt: new Date('2026-11-01T08:00:00Z') })
  })

  it('gives the dates of the period that names one of their groups', () => {
    const activity = restricted(period(dates(undefined, '2026-11-02T08:00:00Z'), groups('g1', 'g2')))

    expect(activityDatesFor(activity, subject([], ['g2']))).toEqual({
      closeAt: new Date('2026-11-02T08:00:00Z'),
    })
  })

  it('keeps the first period that names the person, in the order of the restrictions', () => {
    const activity = restricted(
      period(dates('2026-11-01T08:00:00Z'), members('m9')),
      period(dates('2026-11-02T08:00:00Z'), members('m1')),
      period(dates('2026-11-03T08:00:00Z'), groups('g1'))
    )

    expect(activityDatesFor(activity, subject(['m1'], ['g1']))?.openAt).toEqual(new Date('2026-11-02T08:00:00Z'))
  })

  it('opens without dates a period that names the person but has no date range', () => {
    expect(activityDatesFor(restricted(period(members('m1'))), subject(['m1']))).toEqual({})
  })

  it('falls back on the Others period when no other period names the person', () => {
    const activity = restricted(
      period(dates('2026-11-01T08:00:00Z', '2026-11-02T08:00:00Z'), others),
      period(dates('2026-11-05T08:00:00Z'), members('m1'))
    )

    expect(activityDatesFor(activity, subject(['m2']))).toEqual({
      openAt: new Date('2026-11-01T08:00:00Z'),
      closeAt: new Date('2026-11-02T08:00:00Z'),
    })
    expect(activityDatesFor(activity, subject(['m1']))?.openAt).toEqual(new Date('2026-11-05T08:00:00Z'))
  })

  it('never names the person through the Others period itself, even if it lists them', () => {
    const activity = restricted(
      period(dates('2026-11-01T08:00:00Z'), others, members('m1')),
      period(dates('2026-11-05T08:00:00Z'), members('m1'))
    )

    expect(activityDatesFor(activity, subject(['m1']))).toEqual({ openAt: new Date('2026-11-05T08:00:00Z') })
    expect(activityDatesFor(activity, subject(['m2']))).toEqual({ openAt: new Date('2026-11-01T08:00:00Z') })
  })

  it('gives nothing when no period concerns the person', () => {
    const activity = restricted(period(dates('2026-11-01T08:00:00Z'), members('m1'), groups('g1')))

    expect(activityDatesFor(activity, subject(['m2'], ['g2']))).toBeNull()
  })

  it('names nobody through a member list that holds none of their rows', () => {
    expect(activityDatesFor(restricted(period(members('m1'))), subject(['m2'], ['g1']))).toBeNull()
  })

  it('names every person of a user group listed as a member', () => {
    const activity = restricted(period(dates('2026-11-01T08:00:00Z'), members('group-row')))

    expect(activityDatesFor(activity, subject(['own-row', 'group-row']))).toEqual({
      openAt: new Date('2026-11-01T08:00:00Z'),
    })
  })

  it('names one person of a user group listed as member row and user, and not the others', () => {
    const activity = restricted(
      period(dates('2026-11-01T08:00:00Z'), members('group-row:u1'), correctors('group-row:u9'))
    )

    expect(activityDatesFor(activity, subject(['group-row']))).toEqual({ openAt: new Date('2026-11-01T08:00:00Z') })
    expect(activityDatesFor(activity, { ...subject(['group-row']), userId: 'u2' })).toBeNull()
  })

  it('names nobody through an empty member or group list', () => {
    const activity = restricted(period({ type: 'Members', config: {} }, { type: 'Groups', config: {} }))

    expect(activityDatesFor(activity, subject(['m1'], ['g1']))).toBeNull()
  })
})
