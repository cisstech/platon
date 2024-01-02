import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core'
import { SafePipeModule } from '@cisstech/nge/pipes'
import { NzModalModule } from 'ng-zorro-antd/modal'

@Component({
  standalone: true,
  selector: 'ui-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzModalModule, SafePipeModule],
})
export class UiModalTemplateComponent {
  @Input() title?: string
  @Input() width?: string | null = '90vw'
  @Input() height?: string | null = '90vh'
  @Input() overflow = 'auto'
  @Input() footer?: TemplateRef<void> | null
  @Input() visible = false
  @Input() closable = true
  @Output() closed = new EventEmitter()
  @Output() canceled = new EventEmitter()
  @Output() accepted = new EventEmitter()
  @Output() visibleChange = new EventEmitter<boolean>()

  @ContentChildren(TemplateRef)
  protected templates!: QueryList<TemplateRef<void>>

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  open(): void {
    this.visibleChange.emit((this.visible = true))
    this.changeDetectorRef.markForCheck()
  }

  close(accepted = false): void {
    this.visible = false
    accepted ? this.accepted.emit() : this.canceled.emit()
    this.closed.emit()
    this.visibleChange.emit(false)
    this.changeDetectorRef.markForCheck()
  }
}
