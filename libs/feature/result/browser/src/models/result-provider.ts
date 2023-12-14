import { ListResponse } from '@platon/core/common'
import {
  ActivityResults,
  Correction,
  ActivityCorrection,
  UpsertCorrection,
  UserResults,
} from '@platon/feature/result/common'
import { Observable } from 'rxjs'

export abstract class ResultProvider {
  abstract sessionResults(sessionId: string): Observable<UserResults>
  abstract activityResults(activityId: string): Observable<ActivityResults>

  abstract findCorrection(activityId: string): Observable<ActivityCorrection>
  abstract listCorrections(): Observable<ListResponse<ActivityCorrection>>
  abstract upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction>
}
