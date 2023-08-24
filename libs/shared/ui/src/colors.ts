export const antTagColorFromPercentage = (percentage: number): string => {
  const colorRanges = [
    // red volcano
    { range: [0, 33], color: 'volcano' },
    // yellow gold
    { range: [34, 66], color: 'gold' },
    // lime green
    { range: [67, 99], color: 'lime' },
  ]

  const { color } = colorRanges.find(({ range }) => percentage >= range[0] && percentage <= range[1]) || {
    color: 'green',
  }

  return color as string
}
