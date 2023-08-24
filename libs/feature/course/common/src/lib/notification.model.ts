export const COURSE_MEMBER_CREATION_NOTIFICATION = 'COURSE-MEMBER-CREATION' as const
export interface CourseMemberCreationNotification {
  type: typeof COURSE_MEMBER_CREATION_NOTIFICATION
  courseId: string
  courseName: string
}

export const ACTIVITY_MEMBER_CREATION_NOTIFICATION = 'ACTIVITY-MEMBER-CREATION' as const
export interface ActivityMemberCreationNotification {
  type: typeof ACTIVITY_MEMBER_CREATION_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}

export const CORRECTOR_CREATED_NOTIFICATION = 'CORRECTOR-CREATED' as const
export interface CorrectorCreatedNotification {
  type: typeof CORRECTOR_CREATED_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}

export const CORRECTOR_REMOVED_NOTIFICATION = 'CORRECTOR-REMOVED' as const
export interface CorrectorRemovedNotification {
  type: typeof CORRECTOR_REMOVED_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}

export const CORRECTION_PENDING_NOTIFICATION = 'CORRECTION-PENDING' as const
export interface CorrectionPendingNotification {
  type: typeof CORRECTION_PENDING_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}

export const CORRECTION_AVAILABLE_NOTIFICATION = 'CORRECTION-AVAILABLE' as const
export interface CorrectionAvailableNotification {
  type: typeof CORRECTION_AVAILABLE_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}
