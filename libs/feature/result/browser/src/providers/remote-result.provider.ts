import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivityResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";
import { ResultProvider } from "../models/result-provider";

@Injectable()
export class RemoteResultProvider extends ResultProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.http.get<ActivityResults>(`/api/v1/results/${activityId}`);
  }
}
