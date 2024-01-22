import { getYearMonthWeek } from './dashboard.utils'

describe('DashboardUtils', () => {
  describe('getYearMonthWeek', () => {
    test('returns correct year, month, and week for a date in the first week', () => {
      const date = new Date(2023, 0, 1) // January 1, 2023 (Sunday)
      const result = getYearMonthWeek(date)
      expect(result).toEqual({ year: 2023, month: 1, week: 1 })
    })

    test('returns correct year, month, and week for a date in the second week', () => {
      const date = new Date(2023, 0, 9) // January 9, 2023 (Monday)
      const result = getYearMonthWeek(date)
      expect(result).toEqual({ year: 2023, month: 1, week: 2 })
    })

    test('returns correct year, month, and week for a date in the fifth week', () => {
      const date = new Date(2023, 0, 31) // January 31, 2023 (Tuesday)
      const result = getYearMonthWeek(date)
      expect(result).toEqual({ year: 2023, month: 1, week: 5 })
    })
  })
})
