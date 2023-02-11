import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';


export const RESOURCE_TYPE_NAMES: Record<ResourceTypes, string> = {
  CIRCLE: 'Cercle',
  EXERCISE: 'Exercice',
  ACTIVITY: 'Activité'
};

@Pipe({
  name: 'resourceType',
})
export class ResourceTypePipe implements PipeTransform {
  transform(type: ResourceTypes | string): string {
    return RESOURCE_TYPE_NAMES[type as ResourceTypes];
  }
}
