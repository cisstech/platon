import { followsDates, isLeftToDo, isOpenWithoutDates } from './activity-state'

describe('isLeftToDo', () => {
  it('keeps an open activity until it is handed in', () => {
    expect(isLeftToDo({ state: 'opened', terminated: false })).toBe(true)
    expect(isLeftToDo({ state: 'opened', terminated: true })).toBe(false)
    expect(isLeftToDo({ state: 'planned', terminated: false })).toBe(false)
    expect(isLeftToDo({ state: 'closed', terminated: false })).toBe(false)
  })
})

describe('followsDates and isOpenWithoutDates', () => {
  const open = { state: 'opened' as const, openAt: null, closeAt: null, restricted: false }

  it('reads the dates of an activity, or those its restriction periods give', () => {
    expect(followsDates(open)).toBe(false)
    expect(followsDates({ ...open, openAt: new Date(2026, 8, 1) })).toBe(true)
    expect(followsDates({ ...open, closeAt: new Date(2026, 8, 1) })).toBe(true)
    expect(followsDates({ ...open, restricted: true })).toBe(true)
  })

  it('finds an open activity that has no dates', () => {
    expect(isOpenWithoutDates(open)).toBe(true)
    expect(isOpenWithoutDates({ ...open, restricted: true })).toBe(false)
    expect(isOpenWithoutDates({ ...open, state: 'planned' })).toBe(false)
  })
})
