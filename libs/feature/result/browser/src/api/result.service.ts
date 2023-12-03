import { Injectable } from '@angular/core'
import { ListResponse } from '@platon/core/common'
import {
  ActivityCorrection,
  ActivityResults,
  AnswerStates,
  Correction,
  CreateSessionComment,
  DashboardOutput,
  EXERCISE_ANSWER_RATE,
  EXERCISE_DROP_OUT_RATE,
  SESSION_AVERAGE_SCORE,
  SESSION_AVERAGE_SCORE_BY_MONTH,
  SESSION_DISTRIBUTION_BY_ANSWER_STATE,
  SESSION_SUCCESS_RATE,
  SESSION_TOTAL_DURATION,
  SESSION_TOTAL_DURATION_BY_MONTH,
  SessionComment,
  USER_EXERCISE_COUNT,
  USER_ACTIVITY_COUNT,
  USER_COURSE_COUNT,
  UpsertCorrection,
  UserResults,
} from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'
import { UserDashboardModel } from '../models/dashboard.model'
import { ResultProvider } from '../models/result-provider'
import { SessionCommentProvider } from '../models/session-comment-provider'

@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(
    private readonly resultProvider: ResultProvider,
    private readonly commentProvider: SessionCommentProvider
  ) {}

  userDashboard() {
    return this.resultProvider.userDashboard().pipe(
      map((output) => {
        const user = output['user'] as DashboardOutput
        const model: UserDashboardModel = {
          user: {
            successRate: user[SESSION_SUCCESS_RATE] as number,
            averageScore: user[SESSION_AVERAGE_SCORE] as number,
            totalDuration: user[SESSION_TOTAL_DURATION] as number,
            dropoutRate: user[EXERCISE_DROP_OUT_RATE] as number,
            answerRate: user[EXERCISE_ANSWER_RATE] as number,
            courseCount: user[USER_COURSE_COUNT] as number,
            activityCount: user[USER_ACTIVITY_COUNT] as number,
            exerciseCount: user[USER_EXERCISE_COUNT] as number,
            scoreDistribution: user[SESSION_AVERAGE_SCORE_BY_MONTH] as Record<string, number>,
            durationDistribution: user[SESSION_TOTAL_DURATION_BY_MONTH] as Record<string, number>,
            answerDistribution: user[SESSION_DISTRIBUTION_BY_ANSWER_STATE] as Record<AnswerStates, number>,
          },
        }
        return model
      })
    )
  }

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
