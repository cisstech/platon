import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  standalone: true,
  selector: 'ui-error-403',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzResultModule],
  template: `
  <nz-result
    nzTitle="403"
    nzStatus="403"
    nzSubTitle="Désolé, vous n’êtes pas autorisé à accéder à cette page.">
  </nz-result>
  `
})

export class UiError403Component {}
