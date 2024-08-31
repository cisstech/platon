import { USER_EXERCISE_COUNT } from '@platon/feature/result/common'
import { SessionDataEntity } from '../../sessions/session-data.entity'
import { SessionDataAggregator } from './aggregators'

export class UserExerciseCount implements SessionDataAggregator<number> {
  readonly id = USER_EXERCISE_COUNT

  private total = 0

  next(input: SessionDataEntity): void {
    if (input.attempts) {
      this.total++
    }
  }

  complete(): number {
    return this.total
  }
}
