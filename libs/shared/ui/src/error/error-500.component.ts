import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  standalone: true,
  selector: 'ui-error-500',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzResultModule],
  template: `
  <nz-result
    nzTitle="500"
    nzStatus="500"
    nzSubTitle="Désolé, il y a une erreur sur le serveur.">
  </nz-result>
  `
})
export class Error500Component { }
