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
  booleanAttribute,
} from '@angular/core'
import { SafePipe } from '@cisstech/nge/pipes'
import { NzModalModule } from 'ng-zorro-antd/modal'

@Component({
  standalone: true,
  selector: 'ui-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzModalModule, SafePipe],
})
export class UiModalTemplateComponent {
  @Input() title?: string
  @Input() width?: string | null
  @Input() height?: string | null
  @Input() overflow = 'auto'
  @Input() footer?: TemplateRef<void> | null
  @Input({ transform: booleanAttribute }) visible = false
  @Input({ transform: booleanAttribute }) closable = true
  @Input({ transform: booleanAttribute }) maskClosable = true
  @Input() bodyStyle?: Record<string, string>
  @Output() closed = new EventEmitter()
  @Output() canceled = new EventEmitter()
  @Output() accepted = new EventEmitter()
  @Output() visibleChange = new EventEmitter<boolean>()

  @ContentChildren(TemplateRef)
  protected templates!: QueryList<TemplateRef<void>>

  protected customBodyStyle: Record<string, string> = {}

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  open(): void {
    this.visibleChange.emit((this.visible = true))
    this.customBodyStyle = {
      ...(this.width && { width: this.width }),
      ...(this.height && { height: this.height }),
      ...this.bodyStyle,
      overflow: this.overflow || 'auto',
    }
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
