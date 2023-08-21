import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  ActivityResults,
  Correction,
  ActivityCorrection,
  UpsertCorrection,
  UserResults,
} from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'
import { ResultProvider } from '../models/result-provider'
import { ItemResponse, ListResponse } from '@platon/core/common'

@Injectable()
export class RemoteResultProvider extends ResultProvider {
  constructor(private readonly http: HttpClient) {
    super()
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
