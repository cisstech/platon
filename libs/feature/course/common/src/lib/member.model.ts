import { OrderingDirections, UserOrderings } from "@platon/core/common";

export interface CourseMember {
  readonly userId: string;
  readonly courseId: string;
  readonly group?: {
    id: string,
    name: string
  };
}

export interface CreateCourseMember {
  readonly id: string;
  readonly isGroup?: boolean;
}

export interface CourseMemberFilters {
  readonly search?: string;
  readonly offset?: number;
  readonly limit?: number;
  readonly order?: UserOrderings;
  readonly direction?: OrderingDirections;
}
