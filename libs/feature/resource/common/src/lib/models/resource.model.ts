import { ExpandableModel, Level, OrderingDirections, Topic } from '@platon/core/common'
import { ActivityNavigationModes } from '@platon/feature/compiler'
import { ResourceStatus } from '../enums/resource-status'
import { ResourceTypes } from '../enums/resource-types'
import { FileCreate } from './file.model'
import { ResourceMeta } from './metadata.model'
import { ResourcePermissions, emptyResourcePermissions } from './permissions.model'
import { ResourceStatistic } from './statistic.model'

/**
 * List of fields that can be expanded on a {@link Resource} object.
 */
export type ResourceExpandableFields =
  | 'metadata'
  | 'template'
  | 'parent'
  | 'template.metadata'
  | 'statistic'
  | 'permissions'

/**
 * Enum representing the possible orderings criteria for resources.
 */
export enum ResourceOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  RELEVANCE = 'RELEVANCE',
}

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

  // Expandable fields

  /**
   * List of permissions the user requesting the resource has on it.
   * @remarks
   * - `Expandable` (default in POST, PATCH AND SINGLE GET queries)
   */
  readonly permissions?: ResourcePermissions

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

/**
 * Represents a branch in a hierarchical structure of circles.
 */
export interface CircleTree {
  /**
   * Unique identifier of the circle.
   */
  readonly id: string

  /**
   * Display name of the circle.
   */
  readonly name: string

  /**
   * Unique string representing an alias for accessing this circle files.
   */
  readonly code?: string

  /**
   * List of versions of the circle.
   */
  readonly versions?: string[]

  /**
   * List of children branches.
   */
  readonly children?: CircleTree[]

  /**
   * Permissions of the user requesting the circles.
   */
  readonly permissions?: ResourcePermissions
}

/**
 * Represents a payload for creating a resource.
 */
export interface CreateResource extends ExpandableModel<ResourceExpandableFields> {
  /**
   * Display name of the resource.
   */
  readonly name: string

  /**
   * Unique identifier of the circle the resource belongs to.
   */
  readonly parentId: string

  /**
   * Unique identifier of the exercise from which this resource (assuming that it's an exercise type) is from.
   */
  readonly templateId?: string

  /**
   * Version of the exercise from which this resource (assuming that it's an exercise type) is from.
   */
  readonly templateVersion?: string

  /**
   * Unique string representing an alias for accessing this resource files.
   */
  readonly code?: string

  /**
   * Resource's description.
   */
  readonly desc?: string

  /**
   * Resource's type.
   */
  readonly type: ResourceTypes

  /**
   * Resource's status (default is `ResourceStatus.READY`).
   */
  readonly status?: ResourceStatus

  /**
   * List of levels (identifiers) associated to the resource.
   */
  readonly levels?: string[]

  /**
   * List of topics (identifiers) associated to the resource.
   */
  readonly topics?: string[]

  /**
   * Optional list of files to create with the resource.
   */
  readonly files?: FileCreate[]
}

export interface CreatePreviewResource extends ExpandableModel<ResourceExpandableFields> {
  readonly files: FileCreate[]
}

/**
 * Represents a payload for updating a resource.
 */
export interface UpdateResource extends ExpandableModel<ResourceExpandableFields> {
  /**
   * Replace the resource's name.
   */
  readonly name?: string

  /**
   * Replace the resource's description.
   */
  readonly desc?: string

  /**
   * Mark the resource as publicly previewable or not.
   */
  readonly publicPreview?: boolean

  /**
   * Replace the status of the resource with the one specified.
   */
  readonly status?: ResourceStatus

  /**
   * Replace the levels associated to the resource with the ones specified in the array thanks to their identifiers.
   * @remarks
   * - If not specified, the levels associated to the resource will not be modified.
   * - If an empty array is specified, the levels associated to the resource will be removed.
   */
  readonly levels?: string[]

  /**
   * Replace the topics associated to the resource with the ones specified in the array thanks to their identifiers.
   * @remarks
   * - If not specified, the topics associated to the resource will not be modified.
   * - If an empty array is specified, the topics associated to the resource will be removed.
   */
  readonly topics?: string[]
}

/**
 * Represents a set of parameters for querying a specific resource.
 */
export interface FindResource extends ExpandableModel<ResourceExpandableFields> {
  id: string
  markAsViewed?: boolean
}

/**
 * Represents a set of filters for querying resources.
 */
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
   * Free text search on resource, topics, and levels names.
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
   * Filter resources by whether they are personal or not.
   */
  readonly personal?: boolean

  /**
   * Filter resources by whether they are publicly previewable.
   */
  readonly publicPreview?: boolean

  /**
   * Filter exercises by whether they are configurable or not.
   */
  readonly configurable?: boolean

  /**
   * Filter activities by their navigation settings.
   */
  readonly navigation?: ActivityNavigationModes

  /**
   * Search for specific topics on the resources.
   */
  readonly topics?: string[]

  /**
   * Search for resources that do not have the specified topics.
   */
  readonly antiTopics?: string[]

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
   * Pagination offset.
   */
  readonly offset?: number

  /**
   * Pagination limit.
   */
  readonly limit?: number

  /**
   * Search for resources that are children (direct) of the ones specified in the array.
   */
  readonly parents?: string[]

  /**
   * Ordering criteria.
   */
  readonly order?: ResourceOrderings

  /**
   * Ordering direction.
   */
  readonly direction?: OrderingDirections
}

/**
 * Defines the default ordering directions for resource orderings criteria.
 */
export const RESOURCE_ORDERING_DIRECTIONS: Readonly<Record<ResourceOrderings, keyof typeof OrderingDirections>> = {
  NAME: 'ASC',
  CREATED_AT: 'DESC',
  UPDATED_AT: 'DESC',
  RELEVANCE: 'DESC',
}

/**
 * Retrieves the ancestors of a circle in a tree structure.
 *
 * @param tree - The root of the tree structure.
 * @param circleId - The ID of the circle whose ancestors are to be retrieved.
 * @param includeSelf - Optional. Specifies whether to include the circle itself in the result. Default is false.
 * @returns An array of CircleTree objects representing the ancestors of the specified circle.
 */
export const circleAncestors = (tree: CircleTree, circleId: string, includeSelf?: boolean): CircleTree[] => {
  if (tree.id === circleId) {
    return includeSelf ? [tree] : []
  }

  if (tree.children) {
    for (const child of tree.children) {
      if (child.id === circleId || circleAncestors(child, circleId, false).length > 0) {
        return [...circleAncestors(child, circleId, includeSelf), tree]
      }
    }
  }

  return []
}

/**
 * Flattens a CircleTree by converting it into an array of CircleTree nodes.
 * The flattening is done in a depth-first manner.
 * @example
 * ```ts
 * const tree = {
 *  id: '1',
 *  name: 'root',
 *  children: [
 *    {
 *      id: '2',
 *      name: 'child1',
 *      children: [
 *        {
 *          id: '3',
 *          name: 'child2',
 *        },
 *      ],
 *    },
 *  ],
 * }
 * const flat = flattenCircleTree(tree)
 * // flat = [tree, child1, child2]
 * ```
 * @param tree - The CircleTree to flatten.
 * @returns An array of CircleTree nodes representing the flattened tree.
 */
export const flattenCircleTree = (tree: CircleTree): CircleTree[] => {
  const flat: CircleTree[] = []
  const flatten = (node: CircleTree) => {
    flat.push(node)
    node.children?.forEach(flatten)
  }
  flatten(tree)
  return flat
}

/**
 * Extracts a branch from a CircleTree by its identifier.
 * @param tree - The CircleTree to extract the branch from.
 * @param id - The identifier of the branch to extract.
 * @returns The branch of the CircleTree with the specified identifier if found, otherwise `undefined`.
 */
export const branchFromCircleTree = (tree: CircleTree, id: string): CircleTree | undefined => {
  if (tree.id === id) return tree

  if (tree.children) {
    for (const child of tree.children) {
      const circle = branchFromCircleTree(child, id)
      if (circle) {
        return circle
      }
    }
  }

  return undefined
}

export const removeNodeFromCircleTree = (tree: CircleTree, id: string): CircleTree | undefined => {
  if (tree.id === id) {
    return undefined
  }

  const removeNodeRecursive = (node: CircleTree): boolean => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].id === id) {
          node.children.splice(i, 1)
          return true
        } else {
          if (removeNodeRecursive(node.children[i])) {
            return true
          }
        }
      }
    }
    return false
  }

  removeNodeRecursive(tree)
  return tree
}

/**
 * Converts a circle resource to a CircleTree object.
 * @param circle - The circle resource to convert.
 * @returns The converted CircleTree object.
 */
export const circleTreeFromCircle = (circle: Resource): CircleTree => {
  return {
    id: circle.id,
    name: circle.name,
    code: circle.code,
    versions: circle.metadata?.versions?.map((v) => v.tag),
    permissions: circle.permissions ? { ...circle.permissions } : undefined,
  }
}

/**
 * Converts a list of circles into a circle tree structure.
 * @example
 * ```ts
 * const circles = [
 *  { id: '1', name: 'Circle 1' },
 *  { id: '2', name: 'Circle 2', parentId: '1' },
 *  { id: '3', name: 'Circle 3', parentId: '2' },
 *  { id: '4', name: 'Circle 4', parentId: '2' },
 *  { id: '5', name: 'Circle 5', parentId: '1' },
 * ]
 *
 * const versions = {
 *  '1': ['v1', 'v2'],
 *  '2': ['v3'],
 *  '3': [],
 *  '4': ['v4'],
 *  '5': [],
 * }
 *
 * const tree = circleTreeFromCircleList(circles, versions)
 * // tree = {
 * //   id: '1',
 * //   name: 'Circle 1',
 * //   versions: ['v1', 'v2'],
 * //   children: [
 * //     {
 * //       id: '2',
 * //       name: 'Circle 2',
 * //       versions: ['v3'],
 * //       children: [
 * //         {
 * //           id: '3',
 * //           name: 'Circle 3',
 * //           versions: [],
 * //         },
 * //         {
 * //           id: '4',
 * //           name: 'Circle 4',
 * //           versions: ['v4'],
 * //         },
 * //       ],
 * //     },
 * //     {
 * //       id: '5',
 * //       name: 'Circle 5',
 * //       versions: [],
 * //     },
 * //   ],
 * // }
 * ```
 * @param circles - The list of circles.
 * @param versions - The list of versions for each circle.
 * @returns The circle tree structure.
 * @throws Error if the root circle is not found.
 */
export const circleTreeFromCircleList = (circles: Resource[], versions: Record<string, string[]>): CircleTree => {
  const root = circles.find((c) => !c.parentId && !c.personal)
  if (!root) {
    throw new Error('Root circle not found')
  }

  const tree: CircleTree = {
    id: root.id,
    name: root.name,
    code: root.code,
    versions: versions[root.id] || [],
    children: [],
    permissions: emptyResourcePermissions(),
  }

  const personnalCircles = circles.filter((c) => c.personal)
  personnalCircles.forEach((c) => {
    tree.children?.push({
      id: c.id,
      name: c.name,
      code: c.code,
      versions: versions[c.id] || [],
      permissions: emptyResourcePermissions(),
    })
  })

  const traverse = (node: CircleTree) => {
    const children = circles.filter((c) => c.parentId === node.id).sort((a, b) => a.name.localeCompare(b.name))

    children.forEach((child) => {
      const next: CircleTree = {
        id: child.id,
        name: child.name,
        code: child.code,
        versions: versions[child.id] || [],
        permissions: emptyResourcePermissions(),
      }

      if (!node.children) {
        Object.assign(node, { children: [] })
      }

      node.children?.push(next)

      traverse(next)
    })
  }

  traverse(tree)

  return tree
}
