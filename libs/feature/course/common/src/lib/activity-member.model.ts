import { UserDTO } from "@platon/core/server";
import { CourseMember } from "./course-member.model";

export interface ActivityMember {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly activityId: string;
  readonly user?: UserDTO;
  readonly member: CourseMember;
}

export interface CreateActivityMember {
  readonly userId?: string;
  readonly memberId?: string;
}
