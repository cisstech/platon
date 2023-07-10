import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ListResponse } from '@platon/core/common'
import { Resource, ResourceEvent, ResourceEventFilters } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'
import { ResourceEventProvider } from '../models/resource-event-provider'

@Injectable()
export class RemoteResourceEventProvider extends ResourceEventProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  listEvents(resource: Resource, filters?: ResourceEventFilters): Observable<ListResponse<ResourceEvent>> {
    filters = filters || {}
    let params = new HttpParams()

    if (filters.limit) {
      params = params.append('limit', filters.limit.toString())
    }

    if (filters.offset) {
      params = params.append('offset', filters.offset.toString())
    }

    return this.http.get<ListResponse<ResourceEvent>>(`/api/v1/resources/${resource.id}/events`, {
      params,
    })
  }
}
