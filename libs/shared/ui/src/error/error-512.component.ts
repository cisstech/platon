import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NzResultModule } from 'ng-zorro-antd/result'

@Component({
  standalone: true,
  selector: 'ui-error-512',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzResultModule],
  template: `
    <nz-result
      nzTitle="512"
      nzStatus="500"
      nzSubTitle="Oups ! La sandbox fait sa sieste... 😴 😴 On dirait qu'elle a besoin d'une pause café ☕️"
    >
    </nz-result>
  `,
  styles: [
    `
      :host {
        --ui-error-padding: 1.5rem;
      }
      nz-result {
        padding: var(--ui-error-padding);
      }
    `,
  ],
})
export class UiError512Component {}
