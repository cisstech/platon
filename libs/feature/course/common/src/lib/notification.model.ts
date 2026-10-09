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

export const ACTIVITY_CLOSED_NOTIFICATION = 'ACTIVITY-CLOSED' as const
export interface ActivityClosedNotification {
  type: typeof ACTIVITY_CLOSED_NOTIFICATION
  courseId: string
  courseName: string
  activityId: string
  activityName: string
}

export const RESOURCE_MOVED_BY_ADMIN_NOTIFICATION = 'RESOURCE-MOVED-BY-ADMIN' as const

export interface ResourceMovedByAdminNotification {
  type: typeof RESOURCE_MOVED_BY_ADMIN_NOTIFICATION
  resourceId: string
  resourceName: string
  circleId: string
  circleName: string
}

export const EXERCISE_CHANGES_NOTIFICATION = 'EXERCISE-CHANGES' as const
export interface ExerciseChangesNotification {
  type: typeof EXERCISE_CHANGES_NOTIFICATION
  userId: string
  changes: object
}

export const MODERATION_ACTIVITY_CHANGES_NOTIFICATION = 'MODERATION-ACTIVITY-CHANGES' as const
export interface ModerationActivityChangesNotification {
  type: typeof MODERATION_ACTIVITY_CHANGES_NOTIFICATION
  activity: object
}

/**
 * Notifications that drive a screen (the activity monitor, the player) and that a person never
 * reads: never shown in a list of notifications, never counted as unread.
 */
export const COURSE_SIGNAL_NOTIFICATIONS: readonly string[] = [
  EXERCISE_CHANGES_NOTIFICATION,
  MODERATION_ACTIVITY_CHANGES_NOTIFICATION,
]
