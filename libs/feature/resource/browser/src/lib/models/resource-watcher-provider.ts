import { ListResponse, User } from '@platon/core/common'
import { Resource, ResourceWatcherFilters } from '@platon/feature/resource/common'
import { Observable } from 'rxjs'

export abstract class ResourceWatcherProvider {
  abstract findWatcher(resource: Resource, userId: string): Observable<User>
  abstract createWatcher(resource: Resource): Observable<User>
  abstract deleteWatcher(resource: Resource, userId: string): Observable<void>
  abstract searchWatchers(resource: Resource, filters: ResourceWatcherFilters): Observable<ListResponse<User>>
}
