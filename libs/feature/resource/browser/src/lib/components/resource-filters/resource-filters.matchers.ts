import { Topic, User } from '@platon/core/common'
import {
  CircleTree,
  RESOURCE_ORDERING_DIRECTIONS,
  ResourceFilters,
  ResourceOrderings,
  ResourceStatus,
  ResourceTypes,
} from '@platon/feature/resource/common'
import { FilterIndicator } from '@platon/shared/ui'
import { RESOURCE_ORDERING_NAMES, RESOURCE_STATUS_NAMES, RESOURCE_TYPE_NAMES } from '../../pipes'
import { inject } from '@angular/core'
import { ResourceService } from '../../api/resource.service'
import { firstValueFrom } from 'rxjs'

export const CircleFilterIndicator = (circle: CircleTree): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.parents?.includes(circle.id),
    remove: (filters) => ({ ...filters, parents: filters.parents?.filter((e) => e !== circle.id) }),
    describe: () => `Appartient à "${circle.name}"`,
  }
}

export const ResourceTypeFilterIndicator = (type: ResourceTypes): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.types?.includes(type),
    remove: (filters) => ({
      ...filters,
      types: filters.types?.filter((e) => e !== type),
      ...(type === ResourceTypes.EXERCISE ? { configurable: undefined } : {}),
    }),
    describe: () => RESOURCE_TYPE_NAMES[type],
  }
}

export const ResourceStatusFilterIndicator = (status: ResourceStatus): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.status?.includes(status),
    remove: (filters: ResourceFilters) => ({
      ...filters,
      status: filters.status?.filter((e) => e !== status),
    }),
    describe: () => RESOURCE_STATUS_NAMES[status],
  }
}

export const ResourceOrderingFilterIndicator = (ordering: ResourceOrderings): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => filters.order === ordering,
    remove: (filters: ResourceFilters) => ({
      ...filters,
      order: undefined,
      direction: undefined,
    }),
    describe: (filters) => {
      const value = `${ordering}-${filters.direction || RESOURCE_ORDERING_DIRECTIONS[ordering]}`
      return (
        {
          'NAME-ASC': 'Trier par Nom de A à Z',
          'NAME-DESC': 'Trier par Nom de Z à A',
          'CREATED_AT-DESC': 'Trier par Création : Récent-Ancient',
          'CREATED_AT-ASC': 'Trier par Création : Ancient-Récent',
          'UPDATED_AT-DESC': 'Trier par MàJ : Récente-Ancienne',
          'UPDATED_AT-ASC': 'Trier par MàJ : Ancienne-Récente',
          'RELEVANCE-DESC': 'Trier par Pertinence : Plus-Moins',
          'RELEVANCE-ASC': 'Trier par Pertinence : Moins-Plus',
        }[value] || `Trier par ${RESOURCE_ORDERING_NAMES}`
      )
    },
  }
}

export const ExerciseConfigurableFilterIndicator: FilterIndicator<ResourceFilters> = {
  match: (filters) => !!filters.configurable,
  remove: (filters: ResourceFilters) => ({
    ...filters,
    configurable: undefined,
  }),
  describe: () => 'Exercice configurable',
}

export const OwnerFilterIndicator = (owner: User): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.owners?.includes(owner.id),
    remove: (filters: ResourceFilters) => ({
      ...filters,
      owners: filters.owners?.filter((e) => e !== owner.id),
    }),
    describe: () => `Propriétaire : ${owner.username}`,
  }
}

export const TopicFilterIndicator = (topic: Topic): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.topics?.includes(topic.id),
    remove: (filters: ResourceFilters) => ({
      ...filters,
      topics: filters.topics?.filter((e) => e !== topic.id),
    }),
    describe: () => `Possède le topic "${topic.name}"`,
  }
}

export const AntiTopicFilterIndicator = (topic: Topic): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.antiTopics?.includes(topic.id),
    remove: (filters: ResourceFilters) => ({
      ...filters,
      antiTopics: filters.antiTopics?.filter((e) => e !== topic.id),
    }),
    describe: () => `Ne possède pas le topic "${topic.name}"`,
  }
}

export const LevelFilterIndicator = (level: Topic): FilterIndicator<ResourceFilters> => {
  return {
    match: (filters) => !!filters.levels?.includes(level.id),
    remove: (filters: ResourceFilters) => ({
      ...filters,
      levels: filters.levels?.filter((e) => e !== level.id),
    }),
    describe: () => `Possède le niveau "${level.name}"`,
  }
}

export const ResourceDependOnFilterIndicator = (): FilterIndicator<ResourceFilters> => {
  const resourceService = inject(ResourceService)
  return {
    match: (filters) => {
      return !!filters.dependOn
    },
    remove: (filters: ResourceFilters) => ({
      ...filters,
      dependOn: undefined,
    }),
    describe: async (filters) => {
      const dependOn = await Promise.all(
        filters.dependOn!.map(async (id) => {
          try {
            const resource = await firstValueFrom(resourceService.find({ id, selects: ['name'] }))
            return resource.name
          } catch {
            return id
          }
        })
      )
      return 'Dépend de ' + dependOn.map((name) => `“${name}”`).join(', ')
    },
  }
}
