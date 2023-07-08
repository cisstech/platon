import { Pipe, PipeTransform } from '@angular/core'
import { ResourceEventTypes } from '@platon/feature/resource/common'

export const RESOURCE_EVENT_TYPE_NAMES: Record<ResourceEventTypes, string> = {
  MEMBER_CREATE: 'Nouveau membre',
  MEMBER_REMOVE: 'Membre supprimé',
  RESOURCE_CREATE: 'Nouvelle ressource',
  RESOURCE_STATUS_CHANGE: 'Nouveau status',
}

@Pipe({
  name: 'resourceEventType',
})
export class ResourceEventTypePipe implements PipeTransform {
  transform(type: ResourceEventTypes | string): string {
    return RESOURCE_EVENT_TYPE_NAMES[type as ResourceEventTypes]
  }
}
