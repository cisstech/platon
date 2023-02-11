import { Level, ListResponse, Topic } from "@platon/core/common";
import { CreateResource, Resource, ResourceCompletion, ResourceFilters, UpdateResource } from "@platon/feature/resource/common";
import { Observable } from "rxjs";


export abstract class ResourceProvider {
  // abstract tree(): Observable<CircleTree>;
  abstract topics(): Observable<Topic[]>;
  abstract levels(): Observable<Level[]>;
  abstract completion(): Observable<ResourceCompletion>;

  abstract search(filters?: ResourceFilters): Observable<ListResponse<Resource>>;
  abstract findResourceById(id: number): Observable<Resource>;
  abstract updateResource(id: string, input: UpdateResource): Observable<Resource>;
  abstract createResource(input: CreateResource): Observable<Resource>;

  // Members

  // abstract findMember(circle: Circle, username: string): Observable<CircleMember | undefined>;
  // abstract deleteMember(member: CircleMember): Observable<any>;
  // abstract listMembers(filters: CircleMembersFilters): Observable<PageResult<CircleMember>>;

  // Watchers

  // abstract findWatcher(circle: Circle, username: string): Observable<CircleWatcher | undefined>;
  // abstract createWatcher(circle: Circle): Observable<CircleWatcher>;
  // abstract deleteWatcher(watcher: CircleWatcher): Observable<any>;
  // abstract listWatchers(filters: CircleWatchersFilters): Observable<PageResult<CircleWatcher>>;

  // Invitations

  // abstract createInvitation(form: InvitationForm): Observable<CircleInvitation>;
  // abstract deleteInvitation(invitation: CircleInvitation): Observable<any>;
  // abstract acceptInvitation(invitation: CircleInvitation): Observable<any>;
  // abstract findInvitation(circle: Circle, username: string): Observable<CircleInvitation | undefined>;
  // abstract listInvitations(filters: CircleInvitationsFilters): Observable<PageResult<CircleInvitation>>;

  // Events
  //abstract listEvents(circle: Circle): Observable<PageResult<CircleEvent>>;
  //abstract deleteEvent(event: CircleEvent): Observable<any>;
}
