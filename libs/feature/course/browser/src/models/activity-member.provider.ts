import { ListResponse } from "@platon/core/common";
import { Activity, ActivityMember, CreateActivityMember } from "@platon/feature/course/common";
import { Observable } from "rxjs";

export abstract class ActivityMemberProvider {
  abstract create(activity: Activity, input: CreateActivityMember): Observable<ActivityMember>;
  abstract update(activity: Activity, input: CreateActivityMember[]): Observable<ListResponse<ActivityMember>>;
  abstract search(activity: Activity): Observable<ListResponse<ActivityMember>>;
  abstract delete(member: ActivityMember): Observable<void>;
}
