import { ListResponse } from '@platon/core/common'
import {
  ActivityResults,
  Correction,
  ActivityCorrection,
  UpsertCorrection,
  UserResults,
  DashboardOutput,
} from '@platon/feature/result/common'
import { Observable } from 'rxjs'

export abstract class ResultProvider {
  abstract userDashboard(): Observable<DashboardOutput>
  abstract resourceDashboard(resourceId: string): Observable<DashboardOutput>
  abstract activityDashboard(activityId: string): Observable<DashboardOutput>

  abstract sessionResults(sessionId: string): Observable<UserResults>
  abstract activityResults(activityId: string): Observable<ActivityResults>

  abstract findCorrection(activityId: string): Observable<ActivityCorrection>
  abstract listCorrections(): Observable<ListResponse<ActivityCorrection>>
  abstract upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction>
}
