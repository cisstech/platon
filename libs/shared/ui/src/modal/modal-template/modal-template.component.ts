import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Output, TemplateRef } from '@angular/core';
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

  @ContentChild(TemplateRef)
  template!: TemplateRef<void>

  @Output() closed = new EventEmitter();

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  open(): void {
    this.visible = true;
    this.changeDetectorRef.markForCheck();
  }

  protected close(): void {
    this.visible = false;
    this.closed.emit();
  }
}
