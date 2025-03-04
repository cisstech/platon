import { Activity } from '@platon/feature/course/common'

export const ON_RELOAD_ACTIVITY_EVENT = 'activity.reload'
export const ON_CORRECT_ACTIVITY_EVENT = 'activity.correct'
export const ON_TERMINATE_ACTIVITY_EVENT = 'activity.terminate'
export const ON_REOPEN_ACTIVITY_EVENT = 'activity.reopen'
export const ON_CLOSE_ACTIVITY_EVENT = 'activity.close'
export const ON_CHALLENGE_SUCCEEDED_EVENT = 'activity.challenge.succeeded'

export interface OnReloadActivityEventPayload {
  activity: Activity
}

export interface OnChallengeSuccededEventPayload {
  activity: Activity
}

export interface OnCorrectActivityEventPayload {
  userId: string
  activity: Activity
}

export interface OnTerminateActivityEventPayload {
  activity: Activity
}

export interface OnDeleteActivityEventPayload {
  activity: Activity
}

export interface OnReopenActivityEventPayload {
  activityId: string
}

export interface OnCloseActivityEventPayload {
  activityId: string
}
