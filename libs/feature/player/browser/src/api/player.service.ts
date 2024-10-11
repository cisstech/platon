import { Injectable } from '@angular/core'
import {
  EvalExerciseInput,
  EvalExerciseOutput,
  NextOutput,
  PlayActivityInput,
  PlayActivityOuput,
  PlayAnswersInput,
  PlayAnswersOutput,
  PlayExerciseInput,
  PlayExerciseOuput,
  PreviewInput,
  PreviewOuput,
} from '@platon/feature/player/common'
import { Observable } from 'rxjs'
import { PlayerProvider } from '../models/player-provider'

@Injectable({ providedIn: 'root' })
export class PlayerService {
  constructor(private readonly provider: PlayerProvider) {}

  get(sessionId: string): Observable<PlayExerciseOuput> {
    return this.provider.get(sessionId)
  }

  preview(input: PreviewInput): Observable<PreviewOuput> {
    return this.provider.preview(input)
  }

  playAnswers(input: PlayAnswersInput): Observable<PlayAnswersOutput> {
    return this.provider.playAnswers(input)
  }

  playActivity(input: PlayActivityInput): Observable<PlayActivityOuput> {
    return this.provider.playActivity(input)
  }

  playExercises(input: PlayExerciseInput): Observable<PlayExerciseOuput> {
    return this.provider.playExercises(input)
  }

  next(input: PlayExerciseInput): Observable<NextOutput> {
    const a = this.provider.next(input)
    return a
  }

  evaluate(input: EvalExerciseInput): Observable<EvalExerciseOutput> {
    return this.provider.evaluate(input)
  }

  terminate(sessionId: string): Observable<PlayActivityOuput> {
    return this.provider.terminate(sessionId)
  }
}
