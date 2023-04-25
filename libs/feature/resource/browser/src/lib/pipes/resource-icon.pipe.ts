import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';

export const RESOURCE_ICONS: Record<ResourceTypes, string> = {
  CIRCLE: 'group_work',
  EXERCISE: 'article',
  ACTIVITY: 'widgets'
};

@Pipe({
  name: 'resourceIcon',
})
export class ResourceIconPipe implements PipeTransform {
  transform(type: ResourceTypes | string): string {
    return RESOURCE_ICONS[type as ResourceTypes];
  }
}
