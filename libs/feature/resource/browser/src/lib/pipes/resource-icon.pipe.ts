import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';

const ICONS: Record<ResourceTypes, string> = {
  CIRCLE: 'blue',
  EXERCISE: 'article',
  ACTIVITY: 'widgets'
};

@Pipe({
  name: 'resourceIcon',
})
export class ResourceIconPipe implements PipeTransform {
  transform(type: ResourceTypes): string {
    return ICONS[type];
  }
}
