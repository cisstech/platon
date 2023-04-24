export interface Notification {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
  readAt?: Date;
  data: Record<string, unknown>;
}

export interface NotificationFilters {
  readonly unread?: boolean;
  readonly offset?: number;
  readonly limit?: number;
}
