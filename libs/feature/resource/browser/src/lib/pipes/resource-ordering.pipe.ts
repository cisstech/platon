import { Pipe, PipeTransform } from '@angular/core'
import { ResourceOrderings } from '@platon/feature/resource/common'

export const RESOURCE_ORDERING_NAMES: Record<ResourceOrderings, string> = {
  NAME: 'Nom',
  CREATED_AT: 'Date de création',
  UPDATED_AT: 'Date de mise à jour',
  RELEVANCE: 'Pertinence',
}

@Pipe({
  name: 'resourceOrdering',
})
export class ResourceOrderingPipe implements PipeTransform {
  transform(status: ResourceOrderings | string): string {
    return RESOURCE_ORDERING_NAMES[status as ResourceOrderings]
  }
}
