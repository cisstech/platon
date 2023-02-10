import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';


const NAMES: Record<ResourceTypes, string> = {
  CIRCLE: 'Cercle',
  EXERCISE: 'Exercice',
  ACTIVITY: 'Activité'
};

@Pipe({
  name: 'resourceName',
})
export class ResourceNamePipe implements PipeTransform {
  transform(type: ResourceTypes): string {
    return NAMES[type];
  }
}
