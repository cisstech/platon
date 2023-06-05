import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  standalone: true,
  selector: 'ui-error-404',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzResultModule],
  template: `
  <nz-result
    nzTitle="404"
    nzStatus="404"
    nzSubTitle="
    Le contenu de cette page ne peut pas être affiché.
    Il est possible qu'il soit temporairement indisponible ou supprimé.
    ">
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

export class UiError404Component { }
