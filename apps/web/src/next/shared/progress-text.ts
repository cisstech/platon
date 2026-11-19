import { NO_BREAK_SPACE } from '@platon/design-system'
import { CourseProgress } from '@platon/feature/course/common'
import { plural } from './plural'

/** The progress of a student in a course, in words: « 34 exercices sur 59 », « Cours terminé », or no activity yet. */
export const progressText = ({ done, total, finished }: CourseProgress): string => {
  if (finished) return 'Cours terminé'
  if (!total) return "Aucune activité pour l'instant"
  return `${done} ${plural(done, 'exercice', 'exercices')} sur${NO_BREAK_SPACE}${total}`
}
