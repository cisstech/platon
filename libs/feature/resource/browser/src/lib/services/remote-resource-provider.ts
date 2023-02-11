import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, Level, ListResponse, Topic } from "@platon/core/common";
import { CreateResource, Resource, ResourceCompletion, ResourceFilters, UpdateResource } from "@platon/feature/resource/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResourceProvider } from "../models/resource-provider";

@Injectable()
export class RemoteResourceProvider extends ResourceProvider {
  constructor(private readonly http: HttpClient) {
    super();
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

  completion(): Observable<ResourceCompletion> {
    return this.http.get<ItemResponse<ResourceCompletion>>('/api/v1/completion/resources')
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

    filters.visibilities?.forEach(e => {
      params = params.append('visibilities', e)
    })

    if (filters.order) {
      params = params.append('order', filters.order);
    }

    if (filters.direction) {
      params = params.append('direction', filters.direction);
    }

    if (filters.period) {
      params = params.append('periode', filters.period.toString());
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

    return this.http.get<ListResponse<Resource>>(`/api/v1/resources`, { params });
  }

  findResourceById(id: string, markAsViewed?: boolean): Observable<Resource> {
    let params = new HttpParams();
    if (markAsViewed) {
      params = params.append('markAsViewed', 'true')
    }

    return this.http.get<ItemResponse<Resource>>(`/api/v1/resources/${id}`, {
      params
    }).pipe(
      map(response => response.resource)
    );
  }

  updateResource(id: string, input: UpdateResource): Observable<Resource> {
    return this.http.patch<ItemResponse<Resource>>(`/api/v1/resources/${id}`, input).pipe(
      map(response => response.resource)
    );
  }

  createResource(input: CreateResource): Observable<Resource> {
    return this.http.post<ItemResponse<Resource>>('/api/v1/resources', input).pipe(
      map(response => response.resource)
    );
  }


  // Members

  /*  findMember(circle: Circle, username: string): Observable<CircleMember | undefined> {
     return this.http.get<CircleMember>(`${circle.membersUrl}${username}/`).pipe(
       catchError(() => {
         return of(undefined);
       })
     );
   }

   deleteMember(member: CircleMember): Observable<any> {
     return this.http.delete<any>(member.url);
   }

   listMembers(filters: CircleMembersFilters): Observable<PageResult<CircleMember>> {
     const { circle } = filters;
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
     return this.http.get<PageResult<CircleMember>>(circle.membersUrl, {
       params
     });
   } */

  // Watchers
  /*
    findWatcher(circle: Circle, username: string): Observable<CircleWatcher | undefined> {
      return this.http.get<CircleWatcher>(`${circle.watchersUrl}${username}/`).pipe(
        catchError<any, any>(() => {
          return of(undefined);
        })
      );
    }

    createWatcher(circle: Circle): Observable<CircleWatcher> {
      return this.http.post<CircleWatcher>(circle.watchersUrl, {});
    }

    deleteWatcher(watcher: CircleWatcher): Observable<any> {
      return this.http.delete<CircleWatcher>(watcher.url);
    }

    listWatchers(filters: CircleWatchersFilters): Observable<PageResult<CircleWatcher>> {
      const { circle } = filters;
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
      return this.http.get<PageResult<CircleWatcher>>(circle.watchersUrl, {
        params
      });
    } */

  // Invitations

  /*  createInvitation(form: InvitationForm): Observable<CircleInvitation> {
     return this.http.post<CircleInvitation>(form.circle.invitationsUrl, {
       invitee: form.invitee,
       status: form.status,
     });
   }

   deleteInvitation(invitation: CircleInvitation): Observable<any> {
     return this.http.delete<any>(invitation.url);
   }

   acceptInvitation(invitation: CircleInvitation): Observable<any> {
     return this.http.patch<CircleInvitation>(invitation.url, {});
   }

   findInvitation(circle: Circle, username: string): Observable<CircleInvitation | undefined> {
     return this.http.get<CircleInvitation>(`${circle.invitationsUrl}${username}/`).pipe(
       catchError(() => {
         return of(undefined);
       })
     );
   }

   listInvitations(filters: CircleInvitationsFilters): Observable<PageResult<CircleInvitation>> {
     const { circle } = filters;
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
     return this.http.get<PageResult<CircleInvitation>>(circle.invitationsUrl, {
       params
     });
   }
  */

  // Events
  /*  listEvents(circle: Circle): Observable<PageResult<CircleEvent>> {
     return this.http.get<PageResult<CircleEvent>>(circle.eventsUrl);
   }

   deleteEvent(event: CircleEvent): Observable<any> {
     return this.http.delete(event.url);
   } */
}
