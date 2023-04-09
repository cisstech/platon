import { ActivityResults, UserResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";

export abstract class ResultProvider {
  abstract userResults(activityId: string, userId: string): Observable<UserResults>;
  abstract activityResults(activityId: string): Observable<ActivityResults>;
}
