import { Pipe, PipeTransform } from '@angular/core'
import { ResourceStatus } from '@platon/feature/resource/common'

export const RESOURCE_STATUS_COLORS: Record<ResourceStatus, string> = {
  DRAFT: 'blue',
  READY: 'green',
  BUGGED: 'magenta',
  NOT_TESTED: 'gold',
  DEPRECATED: 'red',
}

export const RESOURCE_STATUS_COLORS_HEX: Record<ResourceStatus, string> = {
  DRAFT: '#1890ff',
  READY: '#52c41a',
  BUGGED: '#eb2f96',
  NOT_TESTED: '#faad14',
  DEPRECATED: '#f5222d',
}

@Pipe({
  name: 'resourceStatusColor',
})
export class ResourceStatusColorPipe implements PipeTransform {
  transform(status: ResourceStatus | string): string {
    return RESOURCE_STATUS_COLORS[status as ResourceStatus]
  }
}
