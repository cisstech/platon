import { Pipe, PipeTransform } from '@angular/core';
import { ResourceStatus } from '@platon/feature/resource/common';

const COLORS: Record<ResourceStatus, string> = {
  NONE: 'gray',
  DRAFT: 'blue',
  READY: 'green',
  BUGGED: 'magenta',
  NOT_TESTED: 'gold',
  DEPRECATED: 'red'
};

@Pipe({
  name: 'resourceStatusColor',
})
export class ResourceStatusColorPipe implements PipeTransform {
  transform(status: ResourceStatus | string): string {
    return COLORS[status as ResourceStatus];
  }
}
