import { ListResponse } from '@platon/core/common'
import { CreateResourceInvitation, Resource, ResourceInvitation } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export abstract class ResourceInvitationProvider {
  abstract deleteInvitation(invitation: ResourceInvitation): Observable<void>
  abstract acceptInvitation(invitation: ResourceInvitation): Observable<void>

  abstract createInvitation(
    resource: string | Resource,
    input: CreateResourceInvitation
  ): Observable<ResourceInvitation>
  abstract findInvitation(resource: string | Resource, inviteeId: string): Observable<ResourceInvitation>
  abstract listInvitations(resource: string | Resource): Observable<ListResponse<ResourceInvitation>>
}
