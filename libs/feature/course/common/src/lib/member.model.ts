import { OrderingDirections, UserOrderings } from "@platon/core/common";


export interface CourseMember {
  readonly userId: string;
  readonly groupId?: string;
}


export interface CourseMemberFilters {
  readonly search?: string;
  readonly offset?: number;
  readonly limit?: number;
  readonly order?: UserOrderings;
  readonly direction?: OrderingDirections;
}
