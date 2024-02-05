import { USER_EXERCISE_COUNT } from '@platon/feature/result/common'
import { SessionView } from '../../sessions/session.view'
import { SessionDataAggregator } from './aggregators'

export class UserExerciseCount implements SessionDataAggregator<number> {
  readonly id = USER_EXERCISE_COUNT

  private total = 0

  next(input: SessionView): void {
    if (input.attempts) {
      this.total++
    }
  }

  complete(): number {
    return this.total
  }
}
