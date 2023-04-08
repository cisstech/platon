import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { Activity, ActivityFilters, Course, CreateActivity, UpdateActivity } from "@platon/feature/course/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ActivityProvider } from "../models/activity-provider";

@Injectable()
export class RemoteActivityProvider extends ActivityProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  find(courseId: string, activityId: string): Observable<Activity> {
    return this.http.get<ItemResponse<Activity>>(
      `/api/v1/courses/${courseId}/activities/${activityId}`
    ).pipe(
      map(response => response.resource)
    );
  }

  search(course: Course, filters?: ActivityFilters): Observable<ListResponse<Activity>> {
    filters = filters || {};
    let params = new HttpParams();

    if (filters.sectionId) {
      params = params.append('sectionId', filters.sectionId);
    }


    return this.http.get<ListResponse<Activity>>(
      `/api/v1/courses/${course.id}/activities`, { params }
    );
  }

  create(course: Course, input: CreateActivity): Observable<Activity> {
    return this.http.post<ItemResponse<Activity>>(`/api/v1/courses/${course.id}/activities`, input).pipe(
      map(response => response.resource)
    );
  }

  update(activity: Activity, input: UpdateActivity): Observable<Activity> {
    return this.http.patch<ItemResponse<Activity>>(
      `/api/v1/courses/${activity.courseId}/activities/${activity.id}`, input
    ).pipe(
      map(response => response.resource)
    );
  }

  delete(activity: Activity): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/courses/${activity.courseId}/activities/${activity.id}`
    );
  }
}
