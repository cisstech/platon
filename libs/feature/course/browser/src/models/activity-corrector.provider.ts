import { ListResponse } from "@platon/core/common";
import { Activity, ActivityCorrector, CreateActivityCorrector } from "@platon/feature/course/common";
import { Observable } from "rxjs";

export abstract class ActivityCorrectorProvider {
  abstract create(activity: string | Activity, input: CreateActivityCorrector): Observable<ActivityCorrector>;
  abstract update(activity: string | Activity, input: CreateActivityCorrector[]): Observable<ListResponse<ActivityCorrector>>;
  abstract search(activity: string | Activity): Observable<ListResponse<ActivityCorrector>>;
  abstract delete(member: ActivityCorrector): Observable<void>;
}
