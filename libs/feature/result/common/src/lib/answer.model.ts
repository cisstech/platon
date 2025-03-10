import { ExerciseVariables } from '@platon/feature/compiler'

export enum AnswerStates {
  ANSWERED = 'ANSWERED',
  SUCCEEDED = 'SUCCEEDED',
  PART_SUCC = 'PART_SUCC',
  FAILED = 'FAILED',
  STARTED = 'STARTED',
  NOT_STARTED = 'NOT_STARTED',
  ERROR = 'ERROR',
}

export const AnswerStateIcons: Record<AnswerStates, string> = {
  ANSWERED: 'assignment_turned_in',
  SUCCEEDED: 'check_circle',
  PART_SUCC: 'check_circle',
  FAILED: 'cancel',
  STARTED: 'schedule',
  NOT_STARTED: 'help_outline',
  ERROR: 'error_outline',
}

export const AnswerStateLabels: Record<AnswerStates, string> = {
  ANSWERED: 'Réponse enregistrée',
  SUCCEEDED: 'Réussi',
  PART_SUCC: 'Partiellement Réussi',
  FAILED: 'Échoué',
  STARTED: 'Commencé',
  NOT_STARTED: 'À faire',
  ERROR: 'Erreur',
}

export interface Answer {
  id: string
  createdAt: Date
  updatedAt: Date
  userId?: string | null
  grade: number
  sessionId: string
  variables: ExerciseVariables
}

export const AnswerStateColors: Record<AnswerStates, string> = {
  ANSWERED: '#00BFFF',
  SUCCEEDED: '#32CD32',
  PART_SUCC: 'orange',
  FAILED: '#FF0000',
  STARTED: '#87CEFA',
  NOT_STARTED: '#D3D3D3',
  ERROR: '#A020F0',
}

export const answerStateFromGrade = (grade?: number | null): AnswerStates => {
  if (grade == null) return AnswerStates.NOT_STARTED
  if (grade === 100) return AnswerStates.SUCCEEDED
  if (grade === 0) return AnswerStates.FAILED
  if (grade <= 99 && grade >= 1) return AnswerStates.PART_SUCC
  if (grade === -1) return AnswerStates.ERROR
  return AnswerStates.NOT_STARTED
}
