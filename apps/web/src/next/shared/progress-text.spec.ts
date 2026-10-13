import { courseProgress, PlayableActivity } from '@platon/feature/course/common'
import { progressText } from './progress-text'

const activity = (exercisesDone: number, exerciseCount: number) =>
  ({ courseId: 'ap1', exercisesDone, exerciseCount, terminated: false } as PlayableActivity)
const words = (text: string) => text.replace(/\s/g, ' ')

describe('progressText', () => {
  it('says the exercises done, a course finished, or a course without activities', () => {
    expect(words(progressText(courseProgress('ap1', [activity(34, 59)])))).toBe('34 exercices sur 59')
    expect(progressText(courseProgress('ap1', [activity(4, 4)]))).toBe('Cours terminé')
    expect(progressText(courseProgress('ap1', []))).toBe("Aucune activité pour l'instant")
  })
})
