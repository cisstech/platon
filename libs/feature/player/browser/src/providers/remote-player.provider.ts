import { HttpClient } from '@angular/common/http'
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

@Injectable()
export class RemotePlayerService extends PlayerProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  get(sessionId: string): Observable<PlayExerciseOuput> {
    return this.http.get<PlayExerciseOuput>('/api/v1/player/' + sessionId)
  }

  preview(input: PreviewInput): Observable<PreviewOuput> {
    return this.http.post<PreviewOuput>('/api/v1/player/preview', input)
  }

  playAnswers(input: PlayAnswersInput): Observable<PlayAnswersOutput> {
    return this.http.post<PlayAnswersOutput>('/api/v1/player/play/answers', input)
  }
  playActivity(input: PlayActivityInput): Observable<PlayActivityOuput> {
    return this.http.post<PlayActivityOuput>('/api/v1/player/play/activity', input)
  }

  playExercises(input: PlayExerciseInput): Observable<PlayExerciseOuput> {
    return this.http.post<PlayExerciseOuput>('/api/v1/player/play/exercises', input)
  }

  next(input: PlayExerciseInput): Observable<NextOutput> {
    return this.http.post<NextOutput>('/api/v1/player/next', input)
  }

  evaluate(input: EvalExerciseInput): Observable<EvalExerciseOutput> {
    return this.http.post<EvalExerciseOutput>('/api/v1/player/evaluate', input)
  }

  terminate(sessionId: string): Observable<PlayActivityOuput> {
    return this.http.post<PlayActivityOuput>('/api/v1/player/terminate/' + sessionId, {})
  }
}
