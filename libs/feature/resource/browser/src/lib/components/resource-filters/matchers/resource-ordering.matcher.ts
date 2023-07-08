import { ResourceFilters, ResourceOrderings } from '@platon/feature/resource/common'
import { FilterIndicator } from '@platon/shared/ui'
import { RESOURCE_ORDERING_NAMES } from '../../../pipes'

export const ResourceOrderingFilterMatcher = (ordering: ResourceOrderings) => {
  return (filters: ResourceFilters) =>
    filters.order === ordering
      ? ({
          label: 'Trier par ' + RESOURCE_ORDERING_NAMES[ordering],
          remove: (filters: ResourceFilters) => ({
            ...filters,
            order: undefined,
          }),
        } as FilterIndicator<ResourceFilters>)
      : undefined
}
