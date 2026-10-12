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
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA)
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef)
}
