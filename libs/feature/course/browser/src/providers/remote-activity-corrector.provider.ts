import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { Activity, ActivityCorrector, CreateActivityCorrector } from "@platon/feature/course/common";
import { Observable, map } from "rxjs";
import { ActivityCorrectorProvider } from "../models/activity-corrector.provider";

const id = (activity: string | Activity) => typeof activity === 'string' ? activity : activity.id;
@Injectable()
export class RemoteActivityCorrectorProvider extends ActivityCorrectorProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  create(activity: string | Activity, input: CreateActivityCorrector): Observable<ActivityCorrector> {
    return this.http.post<ItemResponse<ActivityCorrector>>(`/api/v1/activities/${id(activity)}/correctors`, input).pipe(
      map(e => e.resource)
    );
  }

  update(activity: string | Activity, input: CreateActivityCorrector[]): Observable<ListResponse<ActivityCorrector>> {

    return this.http.put<ListResponse<ActivityCorrector>>(`/api/v1/activities/${id(activity)}/correctors`, input);
  }

  search(activity: string | Activity): Observable<ListResponse<ActivityCorrector>> {
    return this.http.get<ListResponse<ActivityCorrector>>(`/api/v1/activities/${id(activity)}/correctors`);
  }

  delete(corrector: ActivityCorrector): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/activities/${corrector.activityId}/correctors/${corrector.id}`
    );
  }
}
