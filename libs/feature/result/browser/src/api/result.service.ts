import { Injectable } from "@angular/core";
import { ActivityResults, UserResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";
import { ResultProvider } from "../models/result-provider";

@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(private readonly provider: ResultProvider) { }

  userResults(activityId: string, userId: string): Observable<UserResults> {
    return this.provider.userResults(activityId, userId)
  }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.provider.activityResults(activityId);
  }
}
