import { ActivityResults } from "@platon/feature/result/common";
import { Observable } from "rxjs";

export abstract class ResultProvider {
  abstract activityResults(activityId: string): Observable<ActivityResults>;
}
