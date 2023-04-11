import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivityResults, Correction, PendingCorrection, UpsertCorrection, UserResults } from "@platon/feature/result/common";
import { Observable, map } from "rxjs";
import { ResultProvider } from "../models/result-provider";
import { ItemResponse, ListResponse } from "@platon/core/common";

@Injectable()
export class RemoteResultProvider extends ResultProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  sessionResults(sessionId: string): Observable<UserResults> {
    return this.http.get<UserResults>(`/api/v1/results/session/${sessionId}`);
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.http.get<ActivityResults>(`/api/v1/results/activity/${activityId}`);
  }

  upsertCorrection(sessionId: string, input: UpsertCorrection): Observable<Correction> {
    return this.http.post<ItemResponse<Correction>>(`/api/v1/results/corrections/${sessionId}`, input).pipe(
      map((response) => response.resource)
    );
  }

  listCorrections(activityId: string): Observable<ListResponse<PendingCorrection>> {
    return this.http.get<ListResponse<PendingCorrection>>(
      `/api/v1/results/corrections/${activityId ? activityId : ""}`
    );
  }
}
