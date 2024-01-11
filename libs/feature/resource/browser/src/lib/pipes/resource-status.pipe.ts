import { Pipe, PipeTransform } from '@angular/core'
import { ResourceStatus } from '@platon/feature/resource/common'

export const RESOURCE_STATUS_NAMES: Record<keyof typeof ResourceStatus, string> = {
  DRAFT: 'Brouillon',
  READY: "Prêt à l'utilisation",
  BUGGED: 'Contient des bugs',
  NOT_TESTED: "Besoin d'être tester",
  DEPRECATED: 'Ne pas utiliser',
}

@Pipe({
  name: 'resourceStatus',
})
export class ResourceStatusPipe implements PipeTransform {
  transform(status: keyof typeof ResourceStatus): string {
    return RESOURCE_STATUS_NAMES[status as ResourceStatus]
  }
}
