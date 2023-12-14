/* eslint-disable @typescript-eslint/no-explicit-any */
import addDays from 'date-fns/addDays'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import fr from 'date-fns/locale/fr'

export interface FilterIndicator<T = unknown> {
  match: (filters: T) => boolean
  remove: (filters: T) => T
  describe(filters: T): string
}

export const PeriodFilterMatcher: FilterIndicator<any> = {
  match: (filters) => filters.period != null && filters.period !== 0,
  remove: (filters) => ({ ...filters, period: 0 }),
  describe: (filters) =>
    `Modifié il y a ${formatDistanceToNow(addDays(new Date(), -filters.period), {
      locale: fr,
    })}`,
}
