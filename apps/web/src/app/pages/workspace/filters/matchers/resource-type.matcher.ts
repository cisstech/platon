import { RESOURCE_TYPE_NAMES } from "@platon/feature/resource/browser"
import { ResourceFilters, ResourceTypes } from "@platon/feature/resource/common"
import { FilterIndicator } from "@platon/shared/ui"

export const ResourceTypeFilterMatcher = (type: ResourceTypes) => {
  return (filters: ResourceFilters) => filters.types?.includes(type)
    ? {
      label: RESOURCE_TYPE_NAMES[type],
      remove: (filters: ResourceFilters) => ({
        ...filters,
        types: filters.types?.filter(e => e !== type)
      })
    } as FilterIndicator<ResourceFilters>
    : undefined
}
