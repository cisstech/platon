import { Pipe, PipeTransform } from '@angular/core';
import { ResourceTypes } from '@platon/feature/resource/common';


export const RESOURCE_TYPE_NAMES: Record<ResourceTypes, string> = {
  CIRCLE: 'Cercle',
  EXERCISE: 'Exercice',
  ACTIVITY: 'Activité'
};

const RESOURCE_TYPE_NAME_PRONOUNS: Record<ResourceTypes, string> = {
  CIRCLE: 'Un cercle',
  EXERCISE: 'un exercice',
  ACTIVITY: 'Une activité'
};

@Pipe({
  name: 'resourceType',
})
export class ResourceTypePipe implements PipeTransform {
  transform(type: ResourceTypes | string, pronoun?: boolean): string {
    return pronoun
      ? RESOURCE_TYPE_NAME_PRONOUNS[type as ResourceTypes]
      : RESOURCE_TYPE_NAMES[type as ResourceTypes];
  }
}
