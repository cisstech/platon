export interface ResourceWatcher {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly resourceId: string
  readonly userId: string
}
