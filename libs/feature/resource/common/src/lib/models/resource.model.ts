import { ExpandableModel, Level, OrderingDirections, Topic } from '@platon/core/common'
import { ActivityNavigationModes } from '@platon/feature/compiler'
import { ResourceStatus } from '../enums/resource-status'
import { ResourceTypes } from '../enums/resource-types'
import { ResourceMeta } from './metadata.model'
import { ResourcePermissions } from './permissions.model'

export type ResourceExpandableFields = 'metadata'

export interface Resource {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly name: string
  readonly code?: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly personal: boolean
  readonly status: ResourceStatus
  readonly levels: Level[]
  readonly topics: Topic[]
  readonly ownerId: string
  readonly parentId?: string
  readonly publicPreview?: boolean
  readonly permissions: ResourcePermissions

  // Expandable fields

  readonly metadata?: ResourceMeta
}

export interface CircleTree {
  readonly id: string
  readonly name: string
  readonly code?: string
  readonly children?: CircleTree[]
  readonly permissions: ResourcePermissions
}

export interface CreateResource extends ExpandableModel<ResourceExpandableFields> {
  readonly name: string
  readonly parentId: string
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
  readonly types?: (keyof typeof ResourceTypes)[]
  readonly status?: (keyof typeof ResourceStatus)[]
  readonly search?: string
  readonly period?: number
  readonly members?: string[]
  readonly watchers?: string[]
  readonly owners?: string[]
  readonly views?: boolean
  readonly publicPreview?: boolean
  readonly configurable?: boolean
  readonly navigation?: ActivityNavigationModes
  readonly topics?: string[]
  readonly levels?: string[]
  readonly usedBy?: string[]
  readonly dependOn?: string[]
  readonly offset?: number
  readonly limit?: number
  readonly parents?: string[]
  readonly order?: ResourceOrderings
  readonly direction?: OrderingDirections
}

export const resourceAncestors = (tree: CircleTree, id: string): CircleTree[] => {
  if (tree.id === id) {
    return []
  }

  if (tree.children) {
    for (const child of tree.children) {
      if (child.id === id) {
        return [tree]
      }
    }
  }

  if (tree.children) {
    for (const child of tree.children) {
      const ancestors = resourceAncestors(child, id)
      if (ancestors.length > 0) {
        return [...ancestors, tree]
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
    permissions: {
      ...resource.permissions,
    },
  }
}
