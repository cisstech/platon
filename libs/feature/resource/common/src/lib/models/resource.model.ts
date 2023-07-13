import { Level, OrderingDirections, Topic } from '@platon/core/common'
import { ResourceStatus } from '../enums/resource-status'
import { ResourceTypes } from '../enums/resource-types'
import { ResourcePermissions } from './permissions.model'

export interface Resource {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
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
  readonly permissions: ResourcePermissions
}

export interface CircleTree {
  readonly id: string
  readonly name: string
  readonly code?: string
  readonly children?: CircleTree[]
}

export interface CreateResource {
  readonly name: string
  readonly parentId: string
  readonly code?: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly status?: ResourceStatus
  readonly levels?: string[]
  readonly topics?: string[]
}

export interface UpdateResource {
  readonly name?: string
  readonly desc?: string
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

export interface ResourceFilters {
  readonly types?: (keyof typeof ResourceTypes)[]
  readonly status?: (keyof typeof ResourceStatus)[]
  readonly search?: string
  readonly period?: number
  readonly members?: string[]
  readonly watchers?: string[]
  readonly owners?: string[]
  readonly views?: boolean
  readonly offset?: number
  readonly limit?: number
  readonly parent?: string
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
