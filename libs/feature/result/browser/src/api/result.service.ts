import { Injectable } from "@angular/core";
import { ActivityResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";
import { ResultProvider } from "../models/result-provider";

@Injectable({ providedIn: 'root' })
export class ResultService {
  constructor(private readonly provider: ResultProvider) { }

  activityResults(activityId: string): Observable<ActivityResults> {
    return this.provider.activityResults(activityId);
  }
}
