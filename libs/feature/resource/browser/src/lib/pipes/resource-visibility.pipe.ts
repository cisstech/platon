import { Pipe, PipeTransform } from '@angular/core';
import { ResourceVisibilities } from '@platon/feature/resource/common';

export const RESOURCE_VISIBILITY_NAMES: Record<ResourceVisibilities, string> = {
  PUBLIC: 'Publique',
  PRIVATE: "Privé",
  PERSONAL: 'Personnel',
};

@Pipe({
  name: 'resourceVisibility'
})
export class ResourceVisibilityPipe implements PipeTransform {
  transform(status: ResourceVisibilities | string): string {
    return RESOURCE_VISIBILITY_NAMES[status as ResourceVisibilities];
  }
}
