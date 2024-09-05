import { AnswerStates, answerStateFromGrade } from '@platon/feature/result/common'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { SessionDataEntity } from '../../sessions/session-data.entity'

/**
 * Represents a data aggregator that takes an input of type TInput and produces an output of type TOutput.
 *
 * - A data aggregator is a processor that takes a stream of input values and produces a single output value.
 * - For example a data aggregator that takes a stream of User sessions and calculates the average grade over all sessions.
 * @template TInput - The type of the input values.
 * @template TOutput - The type of the output value.
 */
export interface DataAggregator<TInput, TOutput = unknown> {
  /**
   * The id of the data aggregator used to identify it.
   */
  readonly id: string

  /**
   * Processes the next input value.
   * @param input The input value to be processed.
   */
  next(input: TInput): void

  /**
   * Returns the aggregated output value.
   * @returns The aggregated output value.
   */
  complete(): TOutput
}

/**
 * Represents an interface for aggregating session data.
 * @template TOutput The type of the aggregated output.
 */
export type SessionDataAggregator<TOutput = unknown> = DataAggregator<SessionDataEntity, TOutput>

/**
 * The maximum duration of a gap between two answers.
 * This value is used to cap the duration of gaps between answers to avoid outliers.
 */
export const MAX_GAP_DURATION = 20 * 60 // 20 minutes in seconds

/**
 * When a gap between two answers is greater than {@link MAX_GAP_DURATION}, it is replaced by this value.
 */
export const DEFAULT_GAP_DURATION = 2 * 60 // 2 minutes in seconds

export const sessionDurationInSeconds = (input: SessionDataEntity): number => {
  const { answers, startedAt, lastGradedAt, parentId } = input
  if (!startedAt || !lastGradedAt) {
    return 0
  }

  if (!parentId) {
    return differenceInSeconds(lastGradedAt, startedAt) // activity session
  }

  if (!answers?.length) {
    return 0
  }

  const gaps = answers.map((answer, index) => {
    if (index === 0) {
      return differenceInSeconds(new Date(answer.createdAt), startedAt)
    } else {
      return differenceInSeconds(new Date(answer.createdAt), new Date(answers[index - 1].createdAt))
    }
  })

  return gaps.reduce((acc, gap) => {
    return acc + (gap > MAX_GAP_DURATION ? DEFAULT_GAP_DURATION : gap)
  }, 0)
}

/**
 * Converts a session view into an answer state.
 * @param session The session view to convert.
 * @returns The corresponding answer state.
 */
export const answerStateFromSession = (session: SessionDataEntity) => {
  return session.startedAt
    ? session.attempts
      ? answerStateFromGrade(session.correctionGrade ?? session.grade)
      : AnswerStates.STARTED
    : AnswerStates.NOT_STARTED
}
