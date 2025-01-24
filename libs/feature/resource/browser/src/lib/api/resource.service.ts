import { Injectable } from '@angular/core'
import { ListResponse, User, UserRoles } from '@platon/core/common'
import {
  CircleTree,
  CreateResource,
  CreateResourceInvitation,
  FindResource,
  Resource,
  ResourceCompletion,
  ResourceEvent,
  ResourceEventFilters,
  ResourceFilters,
  ResourceInvitation,
  ResourceMember,
  ResourceMemberFilters,
  ResourceTypes,
  ResourceWatcherFilters,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { ResourceEventProvider } from '../models/resource-event-provider'
import { ResourceInvitationProvider } from '../models/resource-invitation-provider'
import { ResourceMemberProvider } from '../models/resource-member-provider'
import { ResourceProvider } from '../models/resource-provider'
import { ResourceWatcherProvider } from '../models/resource-watcher-provider'

@Injectable({ providedIn: 'root' })
export class ResourceService {
  constructor(
    private readonly resourceProvider: ResourceProvider,
    private readonly resourceEventProvider: ResourceEventProvider,
    private readonly resourceMemberProvider: ResourceMemberProvider,
    private readonly resourceWatcherProvider: ResourceWatcherProvider,
    private readonly resourceInvitationProvider: ResourceInvitationProvider
  ) {}

  //#region Utils
  canUserCreateResource(user: User, type: ResourceTypes | keyof typeof ResourceTypes): boolean {
    return type === 'CIRCLE'
      ? user.role === UserRoles.admin
      : user.role === UserRoles.admin || user.role === UserRoles.teacher
  }

  editorUrl(resourceId: string, version?: string): string {
    return `/editor/${resourceId}?version=${version || 'latest'}`
  }

  previewUrl(resourceId: string, version?: string): string {
    return `/player/preview/${resourceId}?version=${version || 'latest'}`
  }

  //#endregion

  //#region Resources
  tree(): Observable<CircleTree> {
    return this.resourceProvider.tree()
  }

  circle(username: string): Observable<Resource> {
    return this.resourceProvider.circle(username)
  }

  completion(): Observable<ResourceCompletion> {
    return this.resourceProvider.completion()
  }

  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    return this.resourceProvider.search(filters)
  }

  find(input: FindResource): Observable<Resource> {
    return this.resourceProvider.find(input)
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    return this.resourceProvider.update(id, input)
  }

  create(input: CreateResource): Observable<Resource> {
    return this.resourceProvider.create(input)
  }

  move(id: string, parentId: string): Observable<Resource> {
    return this.resourceProvider.move(id, parentId)
  }

  moveToOwnerCircle(resource: Resource): Observable<Resource> {
    return this.resourceProvider.moveToOwnerCircle(resource)
  }

  delete(resource: Resource): Observable<void> {
    return this.resourceProvider.delete(resource)
  }
  //#endregion

  //#region Members

  join(resource: Resource | string): Observable<ResourceMember> {
    return this.resourceMemberProvider.join(resource)
  }

  acceptJoin(resource: Resource | string, userId: string): Observable<ResourceMember> {
    return this.resourceMemberProvider.update(resource, userId, {
      waiting: false,
      permissions: {
        read: true,
        write: true,
      },
    })
  }

  declineJoin(resource: Resource | string, userId: string): Observable<void> {
    return this.resourceMemberProvider.delete(resource, userId)
  }

  findMember(resource: Resource | string, userId: string): Observable<ResourceMember> {
    return this.resourceMemberProvider.find(resource, userId)
  }

  deleteMember(resource: Resource | string, userId: string): Observable<void> {
    return this.resourceMemberProvider.delete(resource, userId)
  }

  searchMembers(resource: Resource, filters: ResourceMemberFilters): Observable<ListResponse<ResourceMember>> {
    return this.resourceMemberProvider.search(resource, filters)
  }
  //#endregion

  //#region Watchers
  findWatcher(resource: Resource, userId: string): Observable<User> {
    return this.resourceWatcherProvider.findWatcher(resource, userId)
  }

  createWatcher(resource: Resource): Observable<User> {
    return this.resourceWatcherProvider.createWatcher(resource)
  }

  deleteWatcher(resource: Resource, userId: string): Observable<void> {
    return this.resourceWatcherProvider.deleteWatcher(resource, userId)
  }

  listWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>> {
    return this.resourceWatcherProvider.searchWatchers(resource, filters)
  }
  //#endregion

  //#region Invitations
  deleteInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.resourceInvitationProvider.deleteInvitation(invitation)
  }

  acceptInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.resourceInvitationProvider.acceptInvitation(invitation)
  }

  createInvitation(resource: string | Resource, input: CreateResourceInvitation): Observable<ResourceInvitation> {
    return this.resourceInvitationProvider.createInvitation(resource, input)
  }

  findInvitation(resource: string | Resource, inviteeId: string): Observable<ResourceInvitation> {
    return this.resourceInvitationProvider.findInvitation(resource, inviteeId)
  }

  listInvitations(resource: string | Resource): Observable<ListResponse<ResourceInvitation>> {
    return this.resourceInvitationProvider.listInvitations(resource)
  }
  //#endregion

  //#region Events
  listEvents(resource: Resource, filters?: ResourceEventFilters): Observable<ListResponse<ResourceEvent>> {
    return this.resourceEventProvider.listEvents(resource, filters)
  }
  //#endregion

  //#region Owners
  listOwners(): Observable<User[]> {
    return this.resourceProvider.listOwners()
  }
  //#endregion
}
