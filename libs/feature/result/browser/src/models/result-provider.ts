import { ActivityResults, UserResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";

export abstract class ResultProvider {
  abstract sessionResults(sessionId: string): Observable<UserResults>;
  abstract activityResults(activityId: string): Observable<ActivityResults>;
}
