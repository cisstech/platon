import { PlayableActivity } from './activity.model'

/** How far a student has gone in a course: in exercises over all its activities, and in activities. */
export interface CourseProgress {
  readonly done: number
  readonly total: number
  /** Every exercise of the course is done. */
  readonly finished: boolean
  /** The activities of `activityCount` the student finished. */
  readonly activitiesDone: number
  /** The activities that hold exercises: one without has nothing to do. */
  readonly activityCount: number
}

/** An activity a student finished: handed in, or every exercise of it done. */
export const activityDone = (activity: PlayableActivity): boolean =>
  activity.terminated || (activity.exerciseCount > 0 && activity.exercisesDone >= activity.exerciseCount)

/** The progress of a student in the course `courseId`, from their activities in every course. */
export const courseProgress = (courseId: string, activities: PlayableActivity[]): CourseProgress => {
  const own = activities.filter((activity) => activity.courseId === courseId)
  const counted = own.filter((activity) => activity.exerciseCount > 0)
  const done = own.reduce((sum, activity) => sum + activity.exercisesDone, 0)
  const total = own.reduce((sum, activity) => sum + activity.exerciseCount, 0)

  return {
    done,
    total,
    finished: total > 0 && done >= total,
    activitiesDone: counted.filter(activityDone).length,
    activityCount: counted.length,
  }
}
