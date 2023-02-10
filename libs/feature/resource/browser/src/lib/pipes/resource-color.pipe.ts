import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';

const COLORS: Record<ResourceTypes, string> = {
  CIRCLE: '#d89614',
  EXERCISE: '#108ee9',
  ACTIVITY: '#f50'
};

@Pipe({
  name: 'resourceColor',
})
export class ResourceColorPipe implements PipeTransform {
  transform(type: ResourceTypes): string {
    return COLORS[type];
  }
}
