import { Pipe, PipeTransform } from '@angular/core'
import { ResourceStatus } from '@platon/feature/resource/common'

export const RESOURCE_STATUS_ICONS: Record<ResourceStatus | keyof typeof ResourceStatus, string> = {
  DRAFT: 'edit', // or 'create'
  READY: 'check_circle', // or 'done'
  BUGGED: 'bug_report',
  NOT_TESTED: 'help_outline', // or 'pending_actions'
  DEPRECATED: 'block', // or 'do_not_disturb_on'
}

@Pipe({
  name: 'resourceStatusIcon',
})
export class ResourceStatusIconPipe implements PipeTransform {
  transform(status: keyof typeof ResourceStatus): string {
    return RESOURCE_STATUS_ICONS[status]
  }
}
