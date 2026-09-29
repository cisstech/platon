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
  template: `
    <pl-dialog
      [heading]="data.title"
      [headingId]="data.headingId"
      [confirmLabel]="data.okTitle || 'OK'"
      [cancelLabel]="data.noTitle || 'Annuler'"
      [confirmDisabled]="!value()"
      (confirmed)="confirm()"
      (cancelled)="dialogRef.close(undefined)"
    >
      <form class="field" (submit)="$event.preventDefault(); confirm()">
        @if (data.label) {
        <label [for]="inputId">{{ data.label }}</label>
        }
        <input
          [id]="inputId"
          type="text"
          autocomplete="off"
          [value]="value()"
          [attr.aria-labelledby]="data.label ? null : data.headingId"
          (input)="value.set($any($event.target).value)"
        />
      </form>
    </pl-dialog>
  `,
  styles: `
    .field {
      display: grid;
      gap: var(--pl-space-2);
    }
    label {
      font: var(--pl-font-subheading);
    }
    input {
      min-block-size: var(--pl-space-10);
      padding: 0 var(--pl-space-3);
      border: 1px solid var(--pl-color-control);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
  `,
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
