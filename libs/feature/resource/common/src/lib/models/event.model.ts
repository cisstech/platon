/* eslint-disable @typescript-eslint/no-explicit-any */

import { ResourceEventTypes } from "../enums/resource-event-types";

export interface ResourceEvent {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly type: ResourceEventTypes;
  readonly actorId: string
  readonly resourceId: string
  readonly data: Record<string, any>
}


export interface ResourceEventFilters {
  readonly offset?: number;
  readonly limit?: number;
}
