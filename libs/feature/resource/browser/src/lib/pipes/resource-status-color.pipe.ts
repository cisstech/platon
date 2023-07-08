import { Pipe, PipeTransform } from '@angular/core'
import { ResourceStatus } from '@platon/feature/resource/common'

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  DRAFT: 'blue',
  READY: 'green',
  BUGGED: 'magenta',
  NOT_TESTED: 'gold',
  DEPRECATED: 'red',
}

@Pipe({
  name: 'resourceStatusColor',
})
export class ResourceStatusColorPipe implements PipeTransform {
  transform(status: ResourceStatus | string): string {
    return RESOURCE_STATUS_COLORS[status as ResourceStatus]
  }
}
