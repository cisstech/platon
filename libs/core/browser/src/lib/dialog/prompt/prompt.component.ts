import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'core-dialog-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptDialogComponent {
  @Input() value? = ''
  @Input() label = ''

  @Input() okTitle = 'OK'
  @Input() noTitle = 'Annuler'

  @Output() confirmEvent = new EventEmitter<string | undefined>()

  protected confirm(): void {
    if (this.value) {
      this.confirmEvent.emit(this.value)
    }
  }

  protected cancel(): void {
    this.confirmEvent.emit(undefined)
  }
}
