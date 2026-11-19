import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import {
  ActivityCorrection,
  ActivityCorrectionSummary,
  ActivityLeaderboardEntry,
  ActivityResults,
  Correction,
  CorrectionStatus,
  CourseLeaderboardEntry,
  DashboardOutput,
  FindActivityLeaderboard,
  FindCourseLeaderboard,
  RecentCopy,
  UpsertCorrection,
  UserActivityResultsDistribution,
  UserResults,
} from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'
import { ResultProvider } from '../models/result-provider'

@Injectable()
export class RemoteResultProvider extends ResultProvider {
  private readonly http = inject(HttpClient)

  userDashboard(): Observable<DashboardOutput> {
    return this.http.get<DashboardOutput>(`/api/v1/results/dashboard`)
  }

  resourceDashboard(resourceId: string): Observable<DashboardOutput> {
    return this.http.get<DashboardOutput>(`/api/v1/results/dashboard/resources/${resourceId}`)
  }

  activityDashboard(activityId: string): Observable<DashboardOutput> {
    return this.http.get<DashboardOutput>(`/api/v1/results/dashboard/activities/${activityId}`)
  }

  courseLeaderboard(input: FindCourseLeaderboard): Observable<CourseLeaderboardEntry[]> {
    let params = new HttpParams()
    if (input.limit) {
      params = params.set('limit', input.limit.toString())
    }
    return this.http
      .get<ListResponse<CourseLeaderboardEntry>>(`/api/v1/results/leaderboard/courses/${input.courseId}`, {
        params,
      })
      .pipe(map((response) => response.resources))
  }

  activityLeaderboard(input: FindActivityLeaderboard): Observable<ActivityLeaderboardEntry[]> {
    let params = new HttpParams()
    if (input.limit) {
      params = params.set('limit', input.limit.toString())
    }

    return this.http
      .get<ListResponse<ActivityLeaderboardEntry>>(`/api/v1/results/leaderboard/activities/${input.activityId}`, {
        params,
      })
      .pipe(map((response) => response.resources))
  }

  recentCopies(): Observable<RecentCopy[]> {
    return this.http.get<ListResponse<RecentCopy>>('/api/v1/results/recent').pipe(map((response) => response.resources))
  }

  sessionResults(sessionId: string): Observable<UserResults> {
    return this.http.get<UserResults>(`/api/v1/results/session/${sessionId}`)
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.http.get<ActivityResults>(`/api/v1/results/activity/${activityId}`)
  }

  findCorrection(activityId: string, viewerMode = false): Observable<ActivityCorrection> {
    let params = new HttpParams()
    if (viewerMode) {
      params = params.set('viewer', 'true')
    }

    return this.http
      .get<ListResponse<ActivityCorrection>>(`/api/v1/results/corrections/${activityId}`, { params })
      .pipe(
        map((response) => {
          if (!response.total) {
            throw new Error(`Correction not found for activity ${activityId}`)
          }
          return response.resources[0]
        })
      )
  }

  listCorrections(status?: CorrectionStatus): Observable<ListResponse<ActivityCorrection>> {
    let params = new HttpParams()
    if (status) {
      params = params.set('status', status)
    }
    return this.http.get<ListResponse<ActivityCorrection>>(`/api/v1/results/corrections`, { params })
  }

  listCorrectionsSummary(status?: CorrectionStatus): Observable<ListResponse<ActivityCorrectionSummary>> {
    let params = new HttpParams()
    if (status) {
      params = params.set('status', status)
    }
    return this.http.get<ListResponse<ActivityCorrectionSummary>>(`/api/v1/results/corrections/summary`, { params })
  }

  upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction> {
    return this.http
      .post<ItemResponse<Correction>>(`/api/v1/results/corrections/${sessionId}`, input)
      .pipe(map((response) => response.resource))
  }

  activityResultsForDate(
    activityId: string,
    startDate: number,
    endDate: number
  ): Observable<UserActivityResultsDistribution[]> {
    return this.http.get<UserActivityResultsDistribution[]>(
      `/api/v1/results/dashboard/activities/${activityId}/${startDate}/${endDate}`
    )
  }

  downloadAllSubmissions(
    activityId: string,
    exerciseId: string,
    sessionId: string
  ): Observable<{ blob: Blob; fileName: string }> {
    return this.http
      .get(`/api/v1/sessions/${sessionId}/submissions/${activityId}/${exerciseId}/download-all`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const contentDisposition = response.headers.get('content-disposition') || ''
          let fileName = 'submissions.tar'

          const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1]
          }

          return {
            blob: response.body as Blob,
            fileName,
          }
        })
      )
  }
}
