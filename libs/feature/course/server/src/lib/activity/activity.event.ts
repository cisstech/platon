import { ActivityEntity } from './activity.entity'

export const ON_RELOAD_ACTIVITY_EVENT = 'activity.reload'
export const ON_CORRECT_ACTIVITY_EVENT = 'activity.correct'
export const ON_TERMINATE_ACTIVITY_EVENT = 'activity.terminate'

export interface OnReloadActivityEventPayload {
  activity: ActivityEntity
}

export interface OnCorrectActivityEventPayload {
  userId: string
  activity: ActivityEntity
}

export interface OnTerminateActivityEventPayload {
  activity: ActivityEntity
}
