import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EvalExerciseInput, EvalExerciseOutput, PlayActivityInput, PlayActivityOuput, PlayExerciseInput, PlayExerciseOuput, PreviewInput, PreviewOuput } from '@platon/feature/player/common';
import { Observable } from 'rxjs';
import { PlayerProvider } from '../models/player-provider';

@Injectable()
export class RemotePlayerService extends PlayerProvider {
  constructor(
    private readonly http: HttpClient
  ) {
    super();
  }

  preview(resource: string, version: string): Observable<PreviewOuput> {
    return this.http.post<PreviewOuput>('/api/v1/player/preview', {
      resource,
      version: version || 'latest'
    } as PreviewInput);
  }

  playActivity(input: PlayActivityInput): Observable<PlayActivityOuput> {
    return this.http.post<PlayActivityOuput>('/api/v1/player/play/activity', input);
  }

  playExercises(input: PlayExerciseInput): Observable<PlayExerciseOuput> {
    return this.http.post<PlayExerciseOuput>('/api/v1/player/play/exercises', input);
  }

  evaluate(input: EvalExerciseInput): Observable<EvalExerciseOutput> {
    return this.http.post<EvalExerciseOutput>('/api/v1/player/evaluate', input);
  }

  terminate(sessionId: string): Observable<PlayActivityOuput> {
    return this.http.post<PlayActivityOuput>('/api/v1/player/terminate/' + sessionId, {});
  }
}
