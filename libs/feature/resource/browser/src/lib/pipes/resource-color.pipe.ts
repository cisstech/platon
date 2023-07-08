import { Pipe, PipeTransform } from '@angular/core'
import { ResourceTypes } from '@platon/feature/resource/common'

export const RESOURCE_TYPE_COLORS: Record<ResourceTypes, string> = {
  CIRCLE: '#d89614',
  EXERCISE: '#108ee9',
  ACTIVITY: '#f50',
}

@Pipe({
  name: 'resourceColor',
})
export class ResourceColorPipe implements PipeTransform {
  transform(type: ResourceTypes | string): string {
    return RESOURCE_TYPE_COLORS[type as ResourceTypes]
  }
}
