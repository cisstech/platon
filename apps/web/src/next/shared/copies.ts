import { NO_BREAK_SPACE } from '@platon/design-system'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { plural } from './plural'

/** Copies submitted with at least one exercise still to correct, over every activity. */
export const pendingCopies = (summaries: readonly ActivityCorrectionSummary[]): number =>
  summaries.reduce((total, summary) => total + (summary.pendingCopies ?? 0), 0)

/** What follows a number of copies to correct: « copie à corriger », « copies à corriger ». */
export const copiesToCorrect = (count: number): string => plural(count, 'copie à corriger', 'copies à corriger')

/** « 14 copies à corriger ». */
export const copiesCount = (count: number): string => `${count} ${copiesToCorrect(count)}`

/** « 82 / 100 »: a grade on 100, rounded, its parts kept on one line. */
export const gradeOn100 = (grade: number): string => `${Math.round(grade)}${NO_BREAK_SPACE}/${NO_BREAK_SPACE}100`
