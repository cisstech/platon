import { circleFromTree, CircleTree, ResourceFilters } from "@platon/feature/resource/common"
import { FilterIndicator } from "@platon/shared/ui"

export const CircleFilterMatcher = (tree: () => CircleTree | undefined) => {
  return (filters: ResourceFilters) => filters.parent && tree()
    ? {
      label: `Appartient au cercle ${circleFromTree(tree() as CircleTree, filters.parent)?.name}`,
      remove: (filters) => ({ ...filters, parent: undefined })
    } as FilterIndicator<ResourceFilters>
    : undefined
}
