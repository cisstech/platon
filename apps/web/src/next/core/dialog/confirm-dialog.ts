import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ConfirmOptions } from '@platon/core/browser/shared'
import { Dialog } from '@platon/design-system'

export interface ConfirmDialogData extends ConfirmOptions {
  headingId: string
}

/** The confirmation of `DialogService.confirm`: closes with `true` when confirmed. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog],
  template: `
    <pl-dialog
      [heading]="data.title"
      [headingId]="data.headingId"
      [confirmLabel]="data.okText || 'Confirmer'"
      [cancelLabel]="data.cancelText || 'Annuler'"
      [tone]="data.danger ? 'danger' : 'default'"
      (confirmed)="dialogRef.close(true)"
      (cancelled)="dialogRef.close(false)"
    >
      @if (data.content) {
      <div [innerHTML]="data.content"></div>
      }
    </pl-dialog>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA)
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef)
}
