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
  `,
  styles: [`
    :host {
      --ui-error-padding: 1.5rem;
    }
    nz-result {
      padding: var(--ui-error-padding);
    }
  `]
})
export class UiError500Component { }
