import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { plural } from './plural'

/** Copies submitted with at least one exercise still to correct, over every activity. */
export const pendingCopies = (summaries: readonly ActivityCorrectionSummary[]): number =>
  summaries.reduce((total, summary) => total + (summary.pendingCopies ?? 0), 0)

/** What follows a number of copies to correct: « copie à corriger », « copies à corriger ». */
export const copiesToCorrect = (count: number): string => plural(count, 'copie à corriger', 'copies à corriger')
