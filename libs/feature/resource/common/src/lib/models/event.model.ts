/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ResourceEvent {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly actorId: string
  readonly resourceId: string
  readonly data: Record<string, any>
}

