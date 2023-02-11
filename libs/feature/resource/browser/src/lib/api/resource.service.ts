import { Injectable } from '@angular/core';
import { Level, ListResponse, Topic } from '@platon/core/common';
import { CreateResource, Resource, ResourceCompletion, ResourceFilters, UpdateResource } from '@platon/feature/resource/common';
import { Observable } from 'rxjs';
import { ResourceProvider } from '../models/resource-provider';


@Injectable({ providedIn: 'root' })
export class ResourceService {

  constructor(
    private readonly provider: ResourceProvider,
  ) { }

  topics(): Observable<Topic[]> {
    return this.provider.topics();
  }

  levels(): Observable<Level[]> {
    return this.provider.levels();
  }

  circle(username: string): Observable<Resource> {
    return this.provider.circle(username);
  }

  completion(): Observable<ResourceCompletion> {
    return this.provider.completion();
  }


  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    return this.provider.search(filters);
  }

  findResourceById(id: string, markAsViewed?: boolean): Observable<Resource> {
    return this.provider.findResourceById(id, markAsViewed);
  }

  updateResource(id: string, input: UpdateResource): Observable<Resource> {
    return this.provider.updateResource(id, input);
  }

  createResource(input: CreateResource): Observable<Resource> {
    return this.provider.createResource(input);
  }


  // Members
  /*
    findMember(circle: Circle, username: string): Observable<CircleMember | undefined> {
      return this.provider.findMember(circle, username);
    }
    deleteMember(member: CircleMember): Observable<any> {
      return this.provider.deleteMember(member);
    }
    listMembers(filters: CircleMembersFilters): Observable<PageResult<CircleMember>> {
      return this.provider.listMembers(filters);
    } */

  // Invitations

  /*   createInvitation(form: InvitationForm): Observable<CircleInvitation> {
      return this.provider.createInvitation(form);
    }
    deleteInvitation(invitation: CircleInvitation): Observable<any> {
      return this.provider.deleteInvitation(invitation);
    }
    acceptInvitation(invitation: CircleInvitation): Observable<any> {
      return this.provider.acceptInvitation(invitation);
    }
    findInvitation(circle: Circle, username: string): Observable<CircleInvitation | undefined> {
      return this.provider.findInvitation(circle, username);
    }
    listInvitations(filters: CircleInvitationsFilters): Observable<PageResult<CircleInvitation>> {
      return this.provider.listInvitations(filters);
    } */

  // Events
  /*   listEvents(circle: Circle): Observable<PageResult<CircleEvent>> {
      return this.provider.listEvents(circle);
    }

    deleteEvent(event: CircleEvent): Observable<any> {
      return this.provider.deleteEvent(event);
    } */
}
