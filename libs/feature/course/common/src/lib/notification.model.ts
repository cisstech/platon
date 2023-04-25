
export const COURSE_MEMBER_CREATION_NOTIFICATION = 'COURSE-MEMBER-CREATION' as const;
export interface CourseMemberCreationNotification {
  type: typeof COURSE_MEMBER_CREATION_NOTIFICATION,
  courseId: string,
  courseName: string,
}


export const ACTIVITY_MEMBER_CREATION_NOTIFICATION = 'ACTIVITY-MEMBER-CREATION' as const;
export interface ActivityMemberCreationNotification {
  type: typeof ACTIVITY_MEMBER_CREATION_NOTIFICATION,
  courseId: string,
  courseName: string,
  activityId: string,
  activityName: string,
}
