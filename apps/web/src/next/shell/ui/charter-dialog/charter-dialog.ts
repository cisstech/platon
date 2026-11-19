import { DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Dialog } from '@platon/design-system'

export const CHARTER_HEADING_ID = 'app-charter-title'

/** The licence of the resources, accepted once before creating anything. Closes with `true` when accepted. */
@Component({
  selector: 'app-charter-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog],
  templateUrl: './charter-dialog.html',
})
export class CharterDialog {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef)
  protected readonly headingId = CHARTER_HEADING_ID
}
