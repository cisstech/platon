import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import {
  ActivityCorrection,
  ActivityLeaderboardEntry,
  ActivityResults,
  Correction,
  CourseLeaderboardEntry,
  DashboardOutput,
  FindActivityLeaderboard,
  FindCourseLeaderboard,
  UpsertCorrection,
  UserResults,
} from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'
import { ResultProvider } from '../models/result-provider'

@Injectable()
export class RemoteResultProvider extends ResultProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

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

  sessionResults(sessionId: string): Observable<UserResults> {
    return this.http.get<UserResults>(`/api/v1/results/session/${sessionId}`)
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.http.get<ActivityResults>(`/api/v1/results/activity/${activityId}`)
  }

  findCorrection(activityId: string): Observable<ActivityCorrection> {
    return this.http.get<ListResponse<ActivityCorrection>>(`/api/v1/results/corrections/${activityId}`).pipe(
      map((response) => {
        if (!response.total) {
          throw new Error(`Correction not found for activity ${activityId}`)
        }
        return response.resources[0]
      })
    )
  }

  listCorrections(): Observable<ListResponse<ActivityCorrection>> {
    return this.http.get<ListResponse<ActivityCorrection>>(`/api/v1/results/corrections`)
  }

  upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction> {
    return this.http
      .post<ItemResponse<Correction>>(`/api/v1/results/corrections/${sessionId}`, input)
      .pipe(map((response) => response.resource))
  }
}
