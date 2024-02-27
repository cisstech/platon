/* eslint-disable @typescript-eslint/no-explicit-any */
import addDays from 'date-fns/addDays'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import fr from 'date-fns/locale/fr'

export interface FilterIndicator<T = unknown> {
  match: (filters: T) => boolean
  remove: (filters: T) => T
  describe(filters: T): string | Promise<string>
}

export const PeriodFilterMatcher: FilterIndicator<any> = {
  match: (filters) => filters.period != null && filters.period !== 0,
  remove: (filters) => ({ ...filters, period: undefined }),
  describe: (filters) => {
    const distanceToNow = formatDistanceToNow(addDays(new Date(), -filters.period), {
      locale: fr,
    })
    return `Modifié dans la période : ${distanceToNow}`
  },
}
