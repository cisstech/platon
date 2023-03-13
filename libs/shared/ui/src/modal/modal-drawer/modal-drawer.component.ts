import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { SafePipeModule } from '@cisstech/nge/pipes';
import { NzDrawerModule, NzDrawerPlacement, NzDrawerSize } from 'ng-zorro-antd/drawer';

@Component({
  standalone: true,
  selector: 'ui-modal-drawer',
  templateUrl: './modal-drawer.component.html',
  styleUrls: ['./modal-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzDrawerModule,
    SafePipeModule,
  ]
})
export class UiModalDrawerComponent {
  protected visible = false;

  @ContentChild(TemplateRef)
  template!: TemplateRef<void>

  @Output() closed = new EventEmitter();

  @Input()
  title = ''

  @Input() size: NzDrawerSize = 'default';

  @Input()
  placement: NzDrawerPlacement = 'right'

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
