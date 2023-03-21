import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef } from '@angular/core';
import { SafePipeModule } from '@cisstech/nge/pipes';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  standalone: true,
  selector: 'ui-modal-template',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzModalModule,
    SafePipeModule,
  ]
})
export class UiModalTemplateComponent {
  protected visible = false;


  @Input() title?: string;
  @Input() width = '90vw';
  @Input() height = '90vh';

  @Output() closed = new EventEmitter();
  @Output() canceled = new EventEmitter();
  @Output() accepted = new EventEmitter();

  @ContentChildren(TemplateRef)
  protected templates!: QueryList<TemplateRef<void>>;


  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  open(): void {
    this.visible = true;
    this.changeDetectorRef.markForCheck();
  }

  close(accepted = false): void {
    this.visible = false;
    accepted ? this.accepted.emit() : this.canceled.emit();
    this.closed.emit();
    this.changeDetectorRef.markForCheck();
  }
}
