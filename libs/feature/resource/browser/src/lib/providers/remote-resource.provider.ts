import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { buildExpandableHttpParams, buildHttpParams } from '@platon/core/browser/shared'
import { ItemResponse, ListResponse, User } from '@platon/core/common'
import {
  CircleTree,
  CreatePreviewResource,
  CreateResource,
  FindResource,
  Resource,
  ResourceCompletion,
  ResourceFilters,
  UpdateResource,
} from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ResourceProvider } from '../models/resource-provider'
@Injectable()
export class RemoteResourceProvider extends ResourceProvider {
  private readonly http = inject(HttpClient)

  tree(): Observable<CircleTree> {
    return this.http.get<ItemResponse<CircleTree>>('/api/v1/resources/tree').pipe(map((response) => response.resource))
  }

  circle(username: string): Observable<Resource> {
    return this.http
      .get<ItemResponse<Resource>>(`/api/v1/users/${encodeURIComponent(username)}/circle`)
      .pipe(map((response) => response.resource))
  }
  completion(): Observable<ResourceCompletion> {
    return this.http
      .get<ItemResponse<ResourceCompletion>>('/api/v1/resources/completion')
      .pipe(map((response) => response.resource))
  }

  search(filters?: ResourceFilters): Observable<ListResponse<Resource>> {
    filters = filters || {}
    const params = buildHttpParams(filters)
    return this.http.get<ListResponse<Resource>>(`/api/v1/resources`, { params })
  }

  find(input: FindResource): Observable<Resource> {
    let params = buildExpandableHttpParams(input)
    if (input.markAsViewed) {
      params = params.append('markAsViewed', 'true')
    }

    return this.http
      .get<ItemResponse<Resource>>(`/api/v1/resources/${input.id}`, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  update(id: string, input: UpdateResource): Observable<Resource> {
    const params = buildExpandableHttpParams(input)

    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${id}`, input, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  create(input: CreateResource): Observable<Resource> {
    const params = buildExpandableHttpParams(input)

    return this.http
      .post<ItemResponse<Resource>>('/api/v1/resources', input, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  duplicate(resourceId: string): Observable<Resource> {
    return this.http
      .post<ItemResponse<Resource>>(`/api/v1/resources/${resourceId}/duplicate`, {})
      .pipe(map((response) => response.resource))
  }

  createPreview(input: CreatePreviewResource): Observable<Resource> {
    const params = buildExpandableHttpParams(input)

    return this.http
      .post<ItemResponse<Resource>>('/api/v1/resources/preview', input, {
        params,
      })
      .pipe(map((response) => response.resource))
  }

  move(id: string, parentId: string): Observable<Resource> {
    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${id}/move`, { parentId })
      .pipe(map((response) => response.resource))
  }

  moveToOwnerCircle(resource: Resource): Observable<Resource> {
    const ownerId = resource.ownerId
    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${resource.id}/movetoowner`, { ownerId })
      .pipe(map((response) => response.resource))
  }

  delete(resource: Resource): Observable<void> {
    return this.http.delete<void>(`/api/v1/resources/${resource.id}`)
  }

  listOwners(): Observable<User[]> {
    return this.http.get<ListResponse<User>>(`/api/v1/resources/owners`).pipe(map((response) => response.resources))
  }

  isConfigurableExercise(resourceId: string): Observable<boolean> {
    return this.http
      .get<ItemResponse<boolean>>(`/api/v1/resources/${resourceId}/configurable-exercise`)
      .pipe(map((response) => response.resource))
  }

  updateTemplate(resourceId: string, templateId: string, templateVersion: string): Observable<Resource> {
    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${resourceId}/template`, {
        templateId,
        templateVersion,
      })
      .pipe(map((response) => response.resource))
  }

  deleteTemplate(resourceId: string): Observable<Resource> {
    return this.http
      .delete<ItemResponse<Resource>>(`/api/v1/resources/${resourceId}/template`)
      .pipe(map((response) => response.resource))
  }

  updateCertification(resourceId: string, certified: boolean): Observable<Resource> {
    return this.http
      .patch<ItemResponse<Resource>>(`/api/v1/resources/${resourceId}/certification`, {
        certified,
      })
      .pipe(map((response) => response.resource))
  }
}
