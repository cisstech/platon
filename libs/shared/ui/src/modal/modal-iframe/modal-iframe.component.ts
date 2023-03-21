import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { SafePipeModule } from '@cisstech/nge/pipes';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  standalone: true,
  selector: 'ui-modal-iframe',
  templateUrl: './modal-iframe.component.html',
  styleUrls: ['./modal-iframe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    SafePipeModule,
  ]
})
export class UiModalIFrameComponent {
  protected visible = false;
  protected url?: string;

  @Output() closed = new EventEmitter();
  @Output() canceled = new EventEmitter();
  @Output() accepted = new EventEmitter();


  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  open(url: string): void {
    this.url = url;
    this.visible = true;
    this.changeDetectorRef.markForCheck();
  }

  protected close(accepted = false): void {
    this.visible = false;
    accepted ? this.accepted.emit() : this.canceled.emit();
    this.closed.emit();
  }
}
