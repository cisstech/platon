import { OrderingDirections, UserOrderings } from '@platon/core/common'

export interface ResourceWatcherFilters {
  readonly search?: string
  readonly offset?: number
  readonly limit?: number
  readonly order?: UserOrderings
  readonly direction?: OrderingDirections
}
