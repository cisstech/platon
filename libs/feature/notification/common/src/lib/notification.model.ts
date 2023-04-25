export interface Notification<T = unknown> {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
  readAt?: Date;
  data: T;
}

export interface NotificationFilters {
  readonly unread?: boolean;
  readonly offset?: number;
  readonly limit?: number;
}
