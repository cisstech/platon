import { RESOURCE_STATUS_NAMES } from "@platon/feature/resource/browser"
import { ResourceFilters, ResourceStatus } from "@platon/feature/resource/common"
import { FilterIndicator } from "@platon/shared/ui"

export const ResourceStatusFilterMatcher = (status: ResourceStatus) => {
  return (filters: ResourceFilters) => filters.status?.includes(status)
    ? {
      label: RESOURCE_STATUS_NAMES[status],
      remove: (filters: ResourceFilters) => ({
        ...filters,
        status: filters.status?.filter(e => e !== status)
      })
    } as FilterIndicator<ResourceFilters>
    : undefined
}
