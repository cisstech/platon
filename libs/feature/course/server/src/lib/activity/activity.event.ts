import { Activity } from '@platon/feature/course/common'

export const ON_RELOAD_ACTIVITY_EVENT = 'activity.reload'
export const ON_CORRECT_ACTIVITY_EVENT = 'activity.correct'
export const ON_TERMINATE_ACTIVITY_EVENT = 'activity.terminate'

export interface OnReloadActivityEventPayload {
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
