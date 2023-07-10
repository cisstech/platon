import { ListResponse } from '@platon/core/common'
import { Resource, ResourceEvent, ResourceEventFilters } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export abstract class ResourceEventProvider {
  abstract listEvents(
    resource: Resource,
    filters?: ResourceEventFilters
  ): Observable<ListResponse<ResourceEvent>>
}
