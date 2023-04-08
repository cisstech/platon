import { Injectable } from '@angular/core';
import { ListResponse, User } from '@platon/core/common';
import { CircleTree, CreateResource, CreateResourceInvitation, Resource, ResourceCompletion, ResourceEvent, ResourceEventFilters, ResourceFilters, ResourceInvitation, ResourceMember, ResourceMemberFilters, ResourceStatisic, ResourceWatcherFilters, UpdateResource } from '@platon/feature/resource/common';
import { Observable } from 'rxjs';
import { ResourceEventProvider } from '../models/resource-event-provider';
import { ResourceInvitationProvider } from '../models/resource-invitation-provider';
import { ResourceMemberProvider } from '../models/resource-member-provider';
import { ResourceProvider } from '../models/resource-provider';
import { ResourceWatcherProvider } from '../models/resource-watcher-provider';


@Injectable({ providedIn: 'root' })
export class ResourceService {

  constructor(
    private readonly resourceProvider: ResourceProvider,
    private readonly resourceEventProvider: ResourceEventProvider,
    private readonly resourceMemberProvider: ResourceMemberProvider,
    private readonly resourceWatcherProvider: ResourceWatcherProvider,
    private readonly resourceInvitationProvider: ResourceInvitationProvider,

  ) { }

  //#region Resources
  tree(): Observable<CircleTree> {
    return this.resourceProvider.tree()
  }

  circle(username: string): Observable<Resource> {
    return this.resourceProvider.circle(username);
  }

  statistic(resource: Resource): Observable<ResourceStatisic> {
    return this.resourceProvider.statistic(resource);
  }

  completion(): Observable<ResourceCompletion> {
    return this.resourceProvider.completion();
  }

  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    return this.resourceProvider.search(filters);
  }

  find(id: string, markAsViewed?: boolean): Observable<Resource> {
    return this.resourceProvider.find(id, markAsViewed);
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    return this.resourceProvider.update(id, input);
  }

  create(input: CreateResource): Observable<Resource> {
    return this.resourceProvider.create(input);
  }
  //#endregion

  //#region Members
  findMember(resource: Resource, userId: string): Observable<ResourceMember> {
    return this.resourceMemberProvider.findMember(resource, userId);
  }

  deleteMember(resource: Resource, userId: string): Observable<void> {
    return this.resourceMemberProvider.deleteMember(resource, userId);
  }

  searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
    return this.resourceMemberProvider.searchMembers(resource, filters);
  }
  //#endregion

  //#region Watchers
  findWatcher(resource: Resource, userId: string): Observable<User> {
    return this.resourceWatcherProvider.findWatcher(resource, userId);
  }

  createWatcher(resource: Resource): Observable<User> {
    return this.resourceWatcherProvider.createWatcher(resource);
  }

  deleteWatcher(resource: Resource, userId: string): Observable<void> {
    return this.resourceWatcherProvider.deleteWatcher(resource, userId);
  }

  listWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>> {
    return this.resourceWatcherProvider.searchWatchers(resource, filters);
  }
  //#endregion

  //#region Invitations
  deleteInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.resourceInvitationProvider.deleteInvitation(invitation);
  }

  acceptInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.resourceInvitationProvider.acceptInvitation(invitation);
  }

  createInvitation(resource: Resource, input: CreateResourceInvitation): Observable<ResourceInvitation> {
    return this.resourceInvitationProvider.createInvitation(resource, input);
  }

  findInvitation(resource: Resource, inviteeId: string): Observable<ResourceInvitation> {
    return this.resourceInvitationProvider.findInvitation(resource, inviteeId);
  }

  listInvitations(resource: Resource): Observable<ListResponse<ResourceInvitation>> {
    return this.resourceInvitationProvider.listInvitations(resource);
  }
  //#endregion

  //#region Events
  listEvents(resource: Resource, filters?: ResourceEventFilters): Observable<ListResponse<ResourceEvent>> {
    return this.resourceEventProvider.listEvents(resource, filters);
  }
  //#endregion
}
