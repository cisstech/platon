import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse, User } from "@platon/core/common";
import { Resource, ResourceWatcherFilters } from "@platon/feature/resource/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResourceWatcherProvider } from "../models/resource-watcher-provider";

@Injectable()
export class RemoteResourceWatcherProvider extends ResourceWatcherProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  findWatcher(resource: Resource, userId: string): Observable<User> {
    return this.http.get<ItemResponse<User>>(
      `/api/v1/resources/${resource.id}/watchers/${userId}`
    ).pipe(
      map(response => response.resource),
    );
  }

  createWatcher(resource: Resource): Observable<User> {
    return this.http.post<ItemResponse<User>>(
      `/api/v1/resources/${resource.id}/watchers`, {}
    ).pipe(
      map(response => response.resource),
    );
  }

  deleteWatcher(resource: Resource, userId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/resources/${resource.id}/watchers/${userId}`
    );
  }

  searchWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>> {
    let params = new HttpParams();
    if (filters.search) {
      params = params.append('search', filters.search);
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    if (filters.order) {
      params = params.append('order', filters.order.toString());
    }

    return this.http.get<ListResponse<User>>(
      `/api/v1/resources/${resource.id}/watchers`, {
      params
    });
  }
}
