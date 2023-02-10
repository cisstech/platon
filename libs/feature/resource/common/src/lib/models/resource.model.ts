import { Level, Topic } from '@platon/core/common';
import { ResourceStatus } from '../enums/resource-status';
import { ResourceTypes } from '../enums/resource-types';
import { ResourceVisibilities } from '../enums/resource-visibility';

export interface Resource {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly name: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly visibility: ResourceVisibilities
  readonly status: ResourceStatus
  readonly levels: Level[]
  readonly topics: Topic[]
  readonly ownerId: string
  readonly parentId?: string
}

export interface CreateResource {
  readonly name: string
  readonly desc?: string
  readonly type: ResourceTypes
  readonly status?: ResourceStatus
  readonly visibility: ResourceVisibilities
  readonly levels?: string[]
  readonly topics?: string[]
  readonly parentId?: string
}

export interface UpdateResource {
  readonly name?: string
  readonly desc?: string
  readonly status?: ResourceStatus
  readonly levels?: string[]
  readonly topics?: string[]
}
