import { Injectable } from '@angular/core';
import { Level, ListResponse, Topic, User } from '@platon/core/common';
import { CircleTree, CreateResource, CreateResourceInvitation, Resource, ResourceCompletion, ResourceEvent, ResourceFilters, ResourceInvitation, ResourceMember, ResourceMemberFilters, ResourceWatcherFilters, UpdateResource } from '@platon/feature/resource/common';
import { Observable } from 'rxjs';
import { ResourceProvider } from '../models/resource-provider';


@Injectable({ providedIn: 'root' })
export class ResourceService {

  constructor(
    private readonly provider: ResourceProvider,
  ) { }

  tree(): Observable<CircleTree> {
    return this.provider.tree()
  }

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

  findById(id: string, markAsViewed?: boolean): Observable<Resource> {
    return this.provider.findById(id, markAsViewed);
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    return this.provider.update(id, input);
  }

  create(input: CreateResource): Observable<Resource> {
    return this.provider.create(input);
  }


  // Members

  findMember(resource: Resource, userId: string): Observable<ResourceMember | undefined> {
    return this.provider.findMember(resource, userId);
  }

  deleteMember(resource: Resource, userId: string): Observable<void> {
    return this.provider.deleteMember(resource, userId);
  }
  searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
    return this.provider.searchMembers(resource, filters);
  }

  // Watchers

  findWatcher(resource: Resource, userId: string): Observable<User | undefined> {
    return this.provider.findWatcher(resource, userId);
  }
  createWatcher(resource: Resource): Observable<User> {
    return this.provider.createWatcher(resource);
  }
  deleteWatcher(resource: Resource, userId: string): Observable<void> {
    return this.provider.deleteWatcher(resource, userId);
  }
  listWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>> {
    return this.provider.searchWatchers(resource, filters);
  }

  // Invitations

  deleteInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.provider.deleteInvitation(invitation);
  }
  acceptInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.provider.acceptInvitation(invitation);
  }
  createInvitation(resource: Resource, input: CreateResourceInvitation): Observable<ResourceInvitation> {
    return this.provider.createInvitation(resource, input);
  }
  findInvitation(resource: Resource, inviteeId: string): Observable<ResourceInvitation | undefined> {
    return this.provider.findInvitation(resource, inviteeId);
  }
  listInvitations(resource: Resource): Observable<ListResponse<ResourceInvitation>> {
    return this.provider.listInvitations(resource);
  }

  // Events
  listEvents(resource: Resource): Observable<ListResponse<ResourceEvent>> {
    return this.provider.listEvents(resource);
  }
}
