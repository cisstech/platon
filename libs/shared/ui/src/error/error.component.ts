import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core'
import { UiError403Component } from './error-403.component'
import { UiError404Component } from './error-404.component'
import { HttpErrorResponse } from '@angular/common/http'
import { HTTP_STATUS_CODE } from '@platon/core/common'
import { CommonModule } from '@angular/common'
import { UiError500Component } from './error-500.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { RouterModule } from '@angular/router'
import { UiError512Component } from './error-512.component'

@Component({
  standalone: true,
  selector: 'ui-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    UiError403Component,
    UiError404Component,
    UiError500Component,
    UiError512Component,
    NzButtonModule,
  ],
  template: `
    <ng-container [ngSwitch]="code">
      <ng-container *ngSwitchCase="'SERVER_ERROR'">
        <ui-error-500 />
      </ng-container>
      <ng-container *ngSwitchCase="'FORBIDDEN'">
        <ui-error-403 />
      </ng-container>
      <ng-container *ngSwitchCase="'NOT_FOUND'">
        <ui-error-404 />
      </ng-container>
      <ng-container *ngSwitchCase="'SANDBOX_ERROR'">
        <ui-error-512 />
      </ng-container>
    </ng-container>
    <ng-container *ngIf="showMessage">
      <pre>{{ message }}</pre>
    </ng-container>
    <ng-container *ngIf="showButtons">
      <button [routerLink]="'/'" nz-button nzType="primary">Accueil</button>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      ui-error-500,
      ui-error-403,
      ui-error-404 {
        --ui-error-padding: 1.5rem;
      }

      pre {
        margin-bottom: 1.5rem;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class UiErrorComponent implements OnChanges {
  protected message = ''
  protected code: 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'SANDBOX_ERROR' = 'SERVER_ERROR'
  @Input() error?: unknown
  @Input() showMessage = false
  @Input() showButtons = true

  ngOnChanges(): void {
    const status = (this.error as HttpErrorResponse)?.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR

    if (status === 512) {
      this.code = 'SANDBOX_ERROR'
    } else if (status === HTTP_STATUS_CODE.UNAUTHORIZED || status === HTTP_STATUS_CODE.FORBIDDEN) {
      this.code = 'FORBIDDEN'
    } else if (status >= HTTP_STATUS_CODE.BAD_REQUEST && status < HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) {
      this.code = 'NOT_FOUND'
    } else {
      this.code = 'SERVER_ERROR'
    }

    this.message = ''
    if (this.error instanceof HttpErrorResponse && this.showMessage) {
      this.message = this.error.error.message
    }
  }
}
