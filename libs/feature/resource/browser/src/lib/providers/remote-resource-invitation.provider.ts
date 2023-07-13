import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { CreateResourceInvitation, Resource, ResourceInvitation } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResourceInvitationProvider } from '../models/resource-invitation-provider'

@Injectable()
export class RemoteResourceInvitationProvider extends ResourceInvitationProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  createInvitation(resource: string | Resource, input: CreateResourceInvitation): Observable<ResourceInvitation> {
    return this.http
      .post<ItemResponse<ResourceInvitation>>(`/api/v1/resources/${this.withId(resource)}/invitations`, input)
      .pipe(map((response) => response.resource))
  }

  deleteInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.http.delete<void>(`/api/v1/resources/${invitation.resourceId}/invitations/${invitation.inviteeId}`)
  }

  acceptInvitation(invitation: ResourceInvitation): Observable<void> {
    return this.http.patch<void>(`/api/v1/resources/${invitation.resourceId}/invitations/${invitation.inviteeId}`, {})
  }

  findInvitation(resource: string | Resource, inviteeId: string): Observable<ResourceInvitation> {
    return this.http
      .get<ItemResponse<ResourceInvitation>>(`/api/v1/resources/${this.withId(resource)}/invitations/${inviteeId}`)
      .pipe(map((response) => response.resource))
  }

  listInvitations(resource: string | Resource): Observable<ListResponse<ResourceInvitation>> {
    return this.http.get<ListResponse<ResourceInvitation>>(`/api/v1/resources/${this.withId(resource)}/invitations`)
  }

  private withId(resource: string | Resource): string {
    return typeof resource === 'string' ? resource : resource.id
  }
}
