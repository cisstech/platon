import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { SafePipeModule } from '@cisstech/nge/pipes'
import { NzModalModule } from 'ng-zorro-antd/modal'

export const UI_MODAL_IFRAME_CLOSE = 'UI_MODAL_IFRAME_CLOSE'

@Component({
  standalone: true,
  selector: 'ui-modal-iframe',
  templateUrl: './modal-iframe.component.html',
  styleUrls: ['./modal-iframe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzModalModule, SafePipeModule],
})
export class UiModalIFrameComponent implements OnInit, OnDestroy {
  protected url?: string
  protected visible = false
  protected closeableFromIframe = false

  @Input() width = '90vw'
  @Input() height = '90vh'

  @Output() closed = new EventEmitter()
  @Output() canceled = new EventEmitter()
  @Output() accepted = new EventEmitter()

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    window.addEventListener('message', this.onMessage.bind(this))
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.onMessage.bind(this))
  }

  open(url: string, closeableFromIframe = false): void {
    this.url = url
    this.visible = true
    this.closeableFromIframe = closeableFromIframe
    this.changeDetectorRef.markForCheck()
  }

  protected close(accepted = false): void {
    this.visible = false
    this.closeableFromIframe = false
    accepted ? this.accepted.emit() : this.canceled.emit()
    this.closed.emit()
    this.changeDetectorRef.markForCheck()
  }

  private onMessage(event: MessageEvent): void {
    if (event.data === UI_MODAL_IFRAME_CLOSE && this.visible) {
      this.close()
    }
  }
}
