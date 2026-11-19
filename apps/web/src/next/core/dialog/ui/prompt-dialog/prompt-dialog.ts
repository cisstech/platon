import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { PromptOptions } from '@platon/core/browser/shared'
import { Dialog } from '@platon/design-system'

export interface PromptDialogData extends PromptOptions {
  headingId: string
}

/** The prompt of `DialogService.prompt`: closes with the entered value, or nothing when cancelled. */
@Component({
  selector: 'app-prompt-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog],
  templateUrl: './prompt-dialog.html',
  styleUrl: './prompt-dialog.scss',
})
export class PromptDialog {
  protected readonly data = inject<PromptDialogData>(DIALOG_DATA)
  protected readonly dialogRef = inject<DialogRef<string | undefined>>(DialogRef)
  protected readonly value = signal(this.data.value ?? '')
  protected readonly inputId = `${this.data.headingId}-input`

  protected confirm(): void {
    if (this.value()) this.dialogRef.close(this.value())
  }
}
