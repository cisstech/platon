import { PlayableActivity } from './activity.model'
import { courseProgress } from './course-progress'

const activity = (courseId: string, exercisesDone: number, exerciseCount: number, terminated = false) =>
  ({ courseId, exercisesDone, exerciseCount, terminated } as PlayableActivity)

describe('courseProgress', () => {
  it('counts the exercises done, and the activities finished, of one course', () => {
    const activities = [activity('ap1', 12, 12), activity('ap1', 4, 19), activity('ap1', 0, 0), activity('an1', 5, 5)]

    expect(courseProgress('ap1', activities)).toEqual({
      done: 16,
      total: 31,
      finished: false,
      activitiesDone: 1,
      activityCount: 2,
    })
  })

  it('counts an activity handed in as finished, whatever exercises are left', () => {
    expect(courseProgress('ap1', [activity('ap1', 2, 4, true), activity('ap1', 1, 4)])).toMatchObject({
      activitiesDone: 1,
      activityCount: 2,
    })
  })

  it('says a course is finished once every exercise is done', () => {
    expect(courseProgress('al1', [activity('al1', 4, 4), activity('al1', 8, 8)])).toMatchObject({
      finished: true,
      activitiesDone: 2,
    })
  })

  it('says nothing is done in a course without activities', () => {
    expect(courseProgress('new', [])).toEqual({
      done: 0,
      total: 0,
      finished: false,
      activitiesDone: 0,
      activityCount: 0,
    })
  })
})
