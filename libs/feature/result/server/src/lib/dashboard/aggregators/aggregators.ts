import { SessionView } from '../../sessions/session.view'

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
export interface SessionDataAggregator<TOutput = unknown> extends DataAggregator<SessionView, TOutput> {}
