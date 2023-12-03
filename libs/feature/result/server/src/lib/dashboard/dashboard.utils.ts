export const getYearMonthWeek = (date: Date): { year: number; month: number; week: number } => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // Adding 1 because getMonth() returns zero-based month index
  const firstDayOfMonth = new Date(year, month - 1, 1) // Subtracting 1 to get the correct month index
  const dayOfMonth = date.getDate()

  const dayOfWeek = firstDayOfMonth.getDay() // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = 1 - dayOfWeek // Starting day of the week (Sunday) subtracted from the first day of the month
  const weekNumber = Math.ceil((dayOfMonth + startOfWeek) / 7)

  return { year, month, week: weekNumber }
}
