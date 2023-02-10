import { Pipe, PipeTransform } from '@angular/core';
import { ResourceStatus } from '@platon/feature/resource/common';

const LABELS: Record<ResourceStatus, string> = {
  NONE: 'Non défini',
  DRAFT: 'Brouillon',
  READY: "Prêt à l'utilisation",
  BUGGED: 'Contient des bugs',
  NOT_TESTED: "Besoin d'être tester",
  DEPRECATED: 'Ne pas utiliser'
};

@Pipe({
  name: 'statusLabel'
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: ResourceStatus): string {
    return LABELS[status];
  }
}
