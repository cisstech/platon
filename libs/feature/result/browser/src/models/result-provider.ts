import { ListResponse } from '@platon/core/common'
import {
  ActivityCorrection,
  ActivityCorrectionSummary,
  ActivityResults,
  Correction,
  CorrectionStatus,
  DashboardOutput,
  ActivityLeaderboardEntry,
  CourseLeaderboardEntry,
  FindActivityLeaderboard,
  FindCourseLeaderboard,
  RecentCopy,
  UpsertCorrection,
  UserActivityResultsDistribution,
  UserResults,
} from '@platon/feature/result/common'
import { Observable } from 'rxjs'

export abstract class ResultProvider {
  abstract userDashboard(): Observable<DashboardOutput>
  abstract resourceDashboard(resourceId: string): Observable<DashboardOutput>
  abstract activityDashboard(activityId: string): Observable<DashboardOutput>

  abstract sessionResults(sessionId: string): Observable<UserResults>
  abstract recentCopies(): Observable<RecentCopy[]>
  abstract activityResults(activityId: string): Observable<ActivityResults>
  abstract activityResultsForDate(
    activityId: string,
    startDate: number,
    endDate: number
  ): Observable<UserActivityResultsDistribution[]>

  abstract courseLeaderboard(input: FindCourseLeaderboard): Observable<CourseLeaderboardEntry[]>
  abstract activityLeaderboard(input: FindActivityLeaderboard): Observable<ActivityLeaderboardEntry[]>

  abstract findCorrection(activityId: string, viewerMode?: boolean): Observable<ActivityCorrection>
  abstract listCorrections(status?: CorrectionStatus): Observable<ListResponse<ActivityCorrection>>
  abstract listCorrectionsSummary(status?: CorrectionStatus): Observable<ListResponse<ActivityCorrectionSummary>>
  abstract upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction>
  abstract downloadAllSubmissions(
    activityId: string,
    exerciseId: string,
    sessionId: string
  ): Observable<{ blob: Blob; fileName: string }>
}
