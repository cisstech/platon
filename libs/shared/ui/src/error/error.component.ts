import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UiError403Component } from './error-403.component';
import { UiError404Component } from './error-404.component';
import { HttpErrorResponse } from '@angular/common/http';
import { HTTP_STATUS_CODE } from '@platon/core/common';
import { CommonModule } from '@angular/common';
import { UiError500Component } from './error-500.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';

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
    NzButtonModule
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
    </ng-container>
    <button [routerLink]="'/'" nz-button nzType="primary">Accueil</button>
  `,
  styles: [`
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class UiErrorComponent {
  protected code: 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' = 'SERVER_ERROR';

  @Input()
  set error(error: unknown) {
    const status = (error as HttpErrorResponse).status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
    if (status === HTTP_STATUS_CODE.UNAUTHORIZED || status === HTTP_STATUS_CODE.FORBIDDEN) {
      this.code = 'FORBIDDEN'
    } else if (status >= HTTP_STATUS_CODE.BAD_REQUEST && status < HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR) {
      this.code = 'NOT_FOUND';
    } else {
      this.code = 'SERVER_ERROR';
    }
  }
}
