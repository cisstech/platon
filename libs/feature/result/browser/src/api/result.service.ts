import { Injectable } from '@angular/core'
import { ListResponse } from '@platon/core/common'
import {
  ActivityResults,
  Correction,
  CreateSessionComment,
  ActivityCorrection,
  SessionComment,
  UpsertCorrection,
  UserResults,
} from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'
import { ResultProvider } from '../models/result-provider'
import { SessionCommentProvider } from '../models/session-comment-provider'

@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(
    private readonly resultProvider: ResultProvider,
    private readonly commentProvider: SessionCommentProvider
  ) {}

  sessionResults(sessionId: string): Observable<UserResults> {
    return this.resultProvider.sessionResults(sessionId)
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.resultProvider.activityResults(activityId)
  }

  findCorrection(activityId: string): Observable<ActivityCorrection> {
    return this.resultProvider.findCorrection(activityId)
  }

  listPendingCorrections(): Observable<ListResponse<ActivityCorrection>> {
    return this.resultProvider.listCorrections().pipe(
      map((response) => {
        response.resources = response.resources.filter((correction) => {
          return correction.exercises.some((exercise) => exercise.correctedAt == null)
        })
        response.total = response.resources.length
        return response
      })
    )
  }

  listAvailableCorrections(): Observable<ListResponse<ActivityCorrection>> {
    return this.resultProvider.listCorrections().pipe(
      map((response) => {
        response.resources = response.resources.filter((correction) => {
          return correction.exercises.every((exercise) => exercise.correctedAt !== null)
        })
        response.total = response.resources.length
        return response
      })
    )
  }

  upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction> {
    return this.resultProvider.upsertCorrection(sessionId, input)
  }

  listComments(sessionId: string, answerId: string): Observable<ListResponse<SessionComment>> {
    return this.commentProvider.list(sessionId, answerId)
  }

  createComment(sessionId: string, answerId: string, input: CreateSessionComment): Observable<SessionComment> {
    return this.commentProvider.create(sessionId, answerId, input)
  }

  deleteComment(comment: SessionComment): Observable<void> {
    return this.commentProvider.delete(comment)
  }
}
