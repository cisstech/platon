import { Level, Topic } from '@platon/core/common';
import { ResourceStatus } from '../enums/resource-status';
import { ResourceTypes } from '../enums/resource-types';
import { ResourceVisibilities } from '../enums/resource-visibility';

export interface Resource {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly name: string
  readonly code?: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly visibility: ResourceVisibilities
  readonly status: ResourceStatus
  readonly levels: Level[]
  readonly topics: Topic[]
  readonly isModel?: boolean
  readonly ownerId: string
  readonly modelId?: string
  readonly parentId?: string
}

export interface CircleTree {
  readonly id: string;
  readonly name: string;
  readonly code?: string;
  readonly visibility: ResourceVisibilities;
  readonly children?: CircleTree[]
}

export interface CreateResource {
  readonly name: string
  readonly code?: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly status?: ResourceStatus
  readonly visibility: ResourceVisibilities
  readonly levels?: string[]
  readonly topics?: string[]
  readonly parentId?: string
  readonly isModel?: boolean
  readonly modelId?: string
}

export interface UpdateResource {
  readonly name?: string
  readonly desc?: string
  readonly status?: ResourceStatus
  readonly levels?: string[]
  readonly topics?: string[]
}


export const resourceAncestors = (tree: CircleTree, id: string): CircleTree[] => {
  if (tree.id === id) {
    return [];
  }

  if (tree.children) {
    for (const child of tree.children) {
      if (child.id === id) {
        return [tree];
      }
    }
  }

  if (tree.children) {
    for (const child of tree.children) {
      const ancestors = resourceAncestors(child, id);
      if (ancestors.length > 0) {
        return [...ancestors, tree];
      }
    }
  }

  return [];
}


export const circleFromTree = (tree: CircleTree, id: string): CircleTree | undefined => {
  if (tree.id === id)
    return tree;


  if (tree.children) {
    for (const child of tree.children) {
      const circle = circleFromTree(child, id);
      if (circle) {
        return circle;
      }
    }
  }

  return undefined;
}

export const flattenCircleTree = (tree: CircleTree): CircleTree[] => {
  const flat: CircleTree[] = [];
  const flatten = (node: CircleTree) => {
    flat.push(node);
    node.children?.forEach(flatten);
  }
  flatten(tree);
  return flat;
}
