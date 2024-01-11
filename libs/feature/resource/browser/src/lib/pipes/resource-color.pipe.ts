import { Pipe, PipeTransform } from '@angular/core'
import { ResourceTypes } from '@platon/feature/resource/common'

export const RESOURCE_TYPE_COLORS: Record<keyof typeof ResourceTypes, string> = {
  CIRCLE: '#d89614',
  EXERCISE: '#108ee9',
  ACTIVITY: '#f50',
}

@Pipe({
  name: 'resourceColor',
})
export class ResourceColorPipe implements PipeTransform {
  transform(type: keyof typeof ResourceTypes): string {
    return RESOURCE_TYPE_COLORS[type as ResourceTypes]
  }
}
