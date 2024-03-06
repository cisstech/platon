import { ExpandableModel, Level, OrderingDirections, Topic } from '@platon/core/common'
import { ActivityNavigationModes } from '@platon/feature/compiler'
import { ResourceStatus } from '../enums/resource-status'
import { ResourceTypes } from '../enums/resource-types'
import { ResourceMeta } from './metadata.model'
import { ResourcePermissions } from './permissions.model'
import { ResourceStatistic } from './statistic.model'

/**
 * List of fields that can be expanded on a {@link Resource} object.
 */
export type ResourceExpandableFields = 'metadata' | 'template' | 'parent' | 'template.metadata' | 'statistic'

/**
 * A container for any educational content.
 */
export interface Resource {
  /**
   * Unique identifier of the resource.
   */
  readonly id: string

  /**
   * Date on which the resource has been created.
   */
  readonly createdAt: Date

  /**
   * Last date on which the resource has been updated.
   * @remarks
   * - External events may trigger this field update like update of resource files.
   */
  readonly updatedAt: Date

  /**
   * Display name of the resource.
   */
  readonly name: string

  /**
   * Unique string representing an alias for accessing this resource files.
   */
  readonly code?: string

  /**
   * Human readable
   */
  readonly desc?: string

  /**
   * Types of the resource.
   */
  readonly type: ResourceTypes

  /**
   * Value indicating whether this resource is inside of personal circle (for non circle resources) or is a personal cirlcle.
   */
  readonly personal: boolean

  /**
   * Current usability status of the resource used
   */
  readonly status: ResourceStatus

  /**
   * List of levels metadata associated to the resource.
   */
  readonly levels: Level[]

  /**
   * List of topics metadata associated to the resource.
   */
  readonly topics: Topic[]

  /**
   * Identifier of the resource's creator.
   */
  readonly ownerId: string

  /**
   * Identifier of the circle the resource belongs to if any.
   */
  readonly parentId?: string

  /**
   * Identifier of the exercise from which this resource (assuming that it's an exercise type) is from.
   */
  readonly templateId?: string

  /**
   * Version of the exercise from which this resource (assuming that it's an exercise type) is from.
   */
  readonly templateVersion?: string

  /**
   * Value indicating whether this resource is publicly previewable.
   */
  readonly publicPreview?: boolean

  /**
   * List of permissions the user requesting the resource has on it.
   */
  readonly permissions: ResourcePermissions

  // Expandable fields

  /**
   * The circle the resource belongs to if any.
   * @remarks
   * - `Expandable`
   */
  readonly parent?: Resource

  /**
   * Some useful metadata informations about the resource.
   * @remarks
   * - `Expandable`
   */
  readonly metadata?: ResourceMeta

  /**
   * The template from which the resource is from if any.
   * @remarks
   * - `Expandable`
   */
  readonly template?: Resource

  /**
   * Some statistics about the resource.
   * @remarks
   * - `Expandable`
   */
  readonly statistic?: ResourceStatistic
}

export interface CircleTree {
  readonly id: string
  readonly name: string
  readonly code?: string
  readonly versions?: string[]
  readonly children?: CircleTree[]
  readonly permissions: ResourcePermissions
}

export interface CreateResource extends ExpandableModel<ResourceExpandableFields> {
  readonly name: string
  readonly parentId: string
  readonly templateId?: string
  readonly templateVersion?: string
  readonly code?: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly status?: ResourceStatus
  readonly levels?: string[]
  readonly topics?: string[]
}

export interface UpdateResource extends ExpandableModel<ResourceExpandableFields> {
  readonly name?: string
  readonly desc?: string
  readonly publicPreview?: boolean
  readonly status?: ResourceStatus
  readonly levels?: string[]
  readonly topics?: string[]
}

export enum ResourceOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  RELEVANCE = 'RELEVANCE',
}

export interface FindResource extends ExpandableModel<ResourceExpandableFields> {
  id: string
  markAsViewed?: boolean
}

export interface ResourceFilters extends ExpandableModel<ResourceExpandableFields> {
  /**
   * Filter resources by their types.
   */
  readonly types?: (keyof typeof ResourceTypes)[]

  /**
   * Filter resources by their status.
   */
  readonly status?: (keyof typeof ResourceStatus)[]

  /**
   * Free text search on resource, topics and levels names.
   */
  readonly search?: string

  /**
   * Filter resources which have been updated in the last period of time.
   */
  readonly period?: number
  /**
   * Filter resources by their members.
   */
  readonly members?: string[]

  /**
   * Filter resources by their watchers.
   */
  readonly watchers?: string[]

  /**
   * Filter resources by their owners.
   */
  readonly owners?: string[]

  /**
   * Filter resources by whether they have been recently viewed by the current user.
   */
  readonly views?: boolean

  /**
   * Filter resources by whether they are publicly previewable.
   */
  readonly publicPreview?: boolean

  /**
   * Filter exercises by whether they are configurable or not.
   */
  readonly configurable?: boolean

  /**
   * Filter activities by their navigation settings
   */
  readonly navigation?: ActivityNavigationModes

  /**
   * Search for specific topics on the resources.
   */
  readonly topics?: string[]

  /**
   * Search for specific levels on the resources.
   */
  readonly levels?: string[]

  /**
   * Search for resources used by the ones specified in the array.
   */
  readonly usedBy?: string[]

  /**
   * Search for resources that use the ones specified in the array.
   */
  readonly dependOn?: string[]

  /**
   * Pagination ofsset
   */
  readonly offset?: number

  /**
   * Pagination limit
   */
  readonly limit?: number

  /**
   * Search for resources that are children (direct) of the ones specified in the array.
   */
  readonly parents?: string[]

  /**
   * Ordering criteria
   */
  readonly order?: ResourceOrderings

  /**
   * Ordering direction
   */
  readonly direction?: OrderingDirections
}

export const RESOURCE_ORDERING_DIRECTIONS: Readonly<Record<ResourceOrderings, keyof typeof OrderingDirections>> = {
  NAME: 'ASC',
  CREATED_AT: 'DESC',
  UPDATED_AT: 'DESC',
  RELEVANCE: 'DESC',
}

export const resourceAncestors = (tree: CircleTree, resourceId: string, includeSelf?: boolean): CircleTree[] => {
  if (tree.id === resourceId) {
    return includeSelf ? [tree] : []
  }

  if (tree.children) {
    for (const child of tree.children) {
      if (child.id === resourceId || resourceAncestors(child, resourceId, false).length > 0) {
        return [...resourceAncestors(child, resourceId, includeSelf), tree]
      }
    }
  }

  return []
}

export const circleFromTree = (tree: CircleTree, id: string): CircleTree | undefined => {
  if (tree.id === id) return tree

  if (tree.children) {
    for (const child of tree.children) {
      const circle = circleFromTree(child, id)
      if (circle) {
        return circle
      }
    }
  }

  return undefined
}

export const flattenCircleTree = (tree: CircleTree): CircleTree[] => {
  const flat: CircleTree[] = []
  const flatten = (node: CircleTree) => {
    flat.push(node)
    node.children?.forEach(flatten)
  }
  flatten(tree)
  return flat
}

export const circleTreeFromResource = (resource: Resource): CircleTree => {
  return {
    id: resource.id,
    name: resource.name,
    code: resource.code,
    versions: resource.metadata?.versions?.map((v) => v.tag),
    permissions: {
      ...resource.permissions,
    },
  }
}
