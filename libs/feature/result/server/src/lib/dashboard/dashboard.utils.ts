import getWeekOfMonth from 'date-fns/getWeekOfMonth'

export const getYearMonthWeek = (date: Date): { year: number; month: number; week: number } => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // Adding 1 because getMonth() returns zero-based month index

  return { year, month, week: getWeekOfMonth(date) }
}
