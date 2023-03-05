import { Level, ListResponse, Topic, User } from "@platon/core/common";
import { CircleTree, CreateResource, CreateResourceInvitation, Resource, ResourceCompletion, ResourceEvent, ResourceEventFilters, ResourceFilters, ResourceInvitation, ResourceMember, ResourceMemberFilters, ResourceStatisic, ResourceWatcherFilters, UpdateResource } from "@platon/feature/resource/common";
import { Observable } from "rxjs";


export abstract class ResourceProvider {
  abstract tree(): Observable<CircleTree>;
  abstract topics(): Observable<Topic[]>;
  abstract levels(): Observable<Level[]>;
  abstract circle(username: string): Observable<Resource>;
  abstract statistic(resource: Resource): Observable<ResourceStatisic>;
  abstract completion(): Observable<ResourceCompletion>;

  abstract search(filters?: ResourceFilters): Observable<ListResponse<Resource>>;
  abstract find(id: string, markAsViewed?: boolean): Observable<Resource>;
  abstract update(id: string, input: UpdateResource): Observable<Resource>;
  abstract create(input: CreateResource): Observable<Resource>;

  // Members

  abstract findMember(resource: Resource, userId: string): Observable<ResourceMember>;
  abstract deleteMember(resource: Resource, userId: string): Observable<void>;
  abstract searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>>;

  // Watchers

  abstract findWatcher(resource: Resource, userId: string): Observable<User>;
  abstract createWatcher(resource: Resource): Observable<User>;
  abstract deleteWatcher(resource: Resource, userId: string): Observable<void>;
  abstract searchWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>>;

  // Invitations

  abstract deleteInvitation(invitation: ResourceInvitation): Observable<void>;
  abstract acceptInvitation(invitation: ResourceInvitation): Observable<void>;
  abstract createInvitation(resource: Resource, input: CreateResourceInvitation): Observable<ResourceInvitation>;
  abstract findInvitation(resource: Resource, inviteeId: string): Observable<ResourceInvitation>;
  abstract listInvitations(resource: Resource): Observable<ListResponse<ResourceInvitation>>;

  // Events
  abstract listEvents(resource: Resource, filters?: ResourceEventFilters): Observable<ListResponse<ResourceEvent>>;
}
