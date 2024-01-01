import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { NzResultModule } from 'ng-zorro-antd/result'

@Component({
  standalone: true,
  selector: 'ui-error-403',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzResultModule, CommonModule, RouterModule],
  template: `
    <nz-result
      nzTitle="403"
      nzStatus="403"
      nzSubTitle="Désolé, vous n’êtes pas autorisé à accéder à cette page."
      [nzExtra]="nzExtra"
    >
      <ng-template #nzExtra>
        <div class="ant-result-subtitle">
          <ng-container *ngIf="reason === 'disabled'">
            Votre compte a été désactivé. Veuillez contacter un administrateur pour plus d'informations.
          </ng-container>
        </div>
      </ng-template>
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
export class UiError403Component {
  protected readonly activatedRouter = inject(ActivatedRoute, { optional: true })

  protected get reason(): string | undefined {
    return this.activatedRouter?.snapshot.queryParamMap.get('reason') ?? undefined
  }
}
