import { OrderingDirections, UserGroup, UserOrderings, UserRoles } from "@platon/core/common";

export interface CourseMember {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly courseId: string;
  readonly userId?: string;
  readonly group?: UserGroup;
}

export interface CreateCourseMember {
  readonly id: string;
  readonly isGroup?: boolean;
}

export interface CourseMemberFilters {
  readonly roles?: UserRoles[];
  readonly search?: string;
  readonly offset?: number;
  readonly limit?: number;
  readonly order?: UserOrderings;
  readonly direction?: OrderingDirections;
}
