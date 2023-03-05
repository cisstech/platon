import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, Level, ListResponse, Topic, User } from "@platon/core/common";
import { CircleTree, CreateResource, CreateResourceInvitation, Resource, ResourceCompletion, ResourceEvent, ResourceEventFilters, ResourceFilters, ResourceInvitation, ResourceMember, ResourceMemberFilters, ResourceStatisic, ResourceWatcherFilters, UpdateResource } from "@platon/feature/resource/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResourceProvider } from "../models/resource-provider";

@Injectable()
export class RemoteResourceProvider extends ResourceProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  tree(): Observable<CircleTree> {
    return this.http.get<ItemResponse<CircleTree>>('/api/v1/resources/tree').pipe(
      map(response => response.resource)
    );
  }


  topics(): Observable<Topic[]> {
    return this.http.get<ListResponse<Topic>>('/api/v1/topics').pipe(
      map(response => response.resources)
    );
  }

  levels(): Observable<Level[]> {
    return this.http.get<ListResponse<Level>>('/api/v1/levels/').pipe(
      map(response => response.resources)
    );
  }

  circle(username: string): Observable<Resource> {
    return this.http.get<ItemResponse<Resource>>(`/api/v1/users/${username}/circle`)
      .pipe(
        map(response => response.resource)
      );
  }

  statistic(resource: Resource): Observable<ResourceStatisic> {
    return this.http.get<ItemResponse<ResourceStatisic>>(`/api/v1/resources/${resource.id}/statistic`)
      .pipe(
        map(response => response.resource)
      );
  }


  completion(): Observable<ResourceCompletion> {
    return this.http.get<ItemResponse<ResourceCompletion>>('/api/v1/resources/completion')
      .pipe(
        map(response => response.resource)
      );
  }

  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    filters = filters || {};
    let params = new HttpParams();

    if (filters.search) {
      params = params.append('search', filters.search);
    }

    filters.types?.forEach(e => {
      params = params.append('types', e)
    })

    filters.status?.forEach(e => {
      params = params.append('status', e)
    })

    filters.members?.forEach(e => {
      params = params.append('members', e);
    });

    filters.owners?.forEach(e => {
      params = params.append('owners', e);
    });

    filters.watchers?.forEach(e => {
      params = params.append('watchers', e);
    });

    if (filters.order) {
      params = params.append('order', filters.order);
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction);
    }

    if (filters.period) {
      params = params.append('period', filters.period.toString());
    }

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    if (filters.views) {
      params = params.append('views', 'true');
    }

    if (filters.parent) {
      params = params.append('parent', filters.parent);
    }

    return this.http.get<ListResponse<Resource>>(`/api/v1/resources`, { params });
  }

  find(id: string, markAsViewed?: boolean): Observable<Resource> {
    let params = new HttpParams();
    if (markAsViewed) {
      params = params.append('markAsViewed', 'true')
    }

    return this.http.get<ItemResponse<Resource>>(`/api/v1/resources/${id}`, {
      params
    }).pipe(
      map(response => response.resource),
    );
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    return this.http.patch<ItemResponse<Resource>>(`/api/v1/resources/${id}`, input).pipe(
      map(response => response.resource)
    );
  }

  create(input: CreateResource): Observable<Resource> {
    return this.http.post<ItemResponse<Resource>>('/api/v1/resources', input).pipe(
      map(response => response.resource)
    );
  }


  // Members
  findMember(resource: Resource, userId: string): Observable<ResourceMember> {
    return this.http.get<ItemResponse<ResourceMember>>(
      `/api/v1/resources/${resource.id}/members/${userId}`
    ).pipe(
      map(response => response.resource),
    );
  }

  deleteMember(resource: Resource, userId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/resources/${resource.id}/members/${userId}`
    );
  }

  searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
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

    return this.http.get<ListResponse<ResourceMember>>(
      `/api/v1/resources/${resource.id}/members`, {
      params
    });
  }
  // Watchers

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

  // Invitations

  createInvitation(resource: Resource, input: CreateResourceInvitation): Observable<ResourceInvitation> {
    return this.http.post<ItemResponse<ResourceInvitation>>(
      `/api/v1/resources/${resource.id}/invitations`,
      input
    ).pipe(
      map(response => response.resource)
    );
  }

  deleteInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/resources/${invitation.resourceId}/invitations/${invitation.inviteeId}`
    );
  }

  acceptInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.http.patch<void>(
      `/api/v1/resources/${invitation.resourceId}/invitations/${invitation.inviteeId}`, {}
    );
  }

  findInvitation(resource: Resource, inviteeId: string): Observable<ResourceInvitation> {
    return this.http.get<ItemResponse<ResourceInvitation>>(
      `/api/v1/resources/${resource.id}/invitations/${inviteeId}`
    ).pipe(
      map(response => response.resource)
    );
  }

  listInvitations(resource: Resource): Observable<ListResponse<ResourceInvitation>> {
    return this.http.get<ListResponse<ResourceInvitation>>(
      `/api/v1/resources/${resource.id}/invitations`
    );
  }

  // Events

  listEvents(resource: Resource, filters?: ResourceEventFilters): Observable<ListResponse<ResourceEvent>> {
    filters = filters || {}
    let params = new HttpParams()

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString());
    }

    return this.http.get<ListResponse<ResourceEvent>>(
      `/api/v1/resources/${resource.id}/events`, { params }
    );
  }
}
