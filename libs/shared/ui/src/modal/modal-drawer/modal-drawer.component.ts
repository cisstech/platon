import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
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
  inject,
} from '@angular/core'
import { NzDrawerModule, NzDrawerPlacement, NzDrawerSize } from 'ng-zorro-antd/drawer'

@Component({
  standalone: true,
  selector: 'ui-modal-drawer',
  templateUrl: './modal-drawer.component.html',
  styleUrls: ['./modal-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzDrawerModule],
})
export class UiModalDrawerComponent {
  private readonly breakpointObserver = inject(BreakpointObserver)
  protected visible = false

  @ContentChildren(TemplateRef)
  protected templates!: QueryList<TemplateRef<void>>

  @Output() closed = new EventEmitter()

  @Input() title = ''
  @Input() bodyStyle: Record<string, string> = {}
  @Input() size: NzDrawerSize = 'default'
  @Input() placement: NzDrawerPlacement = 'right'
  @Input({ transform: booleanAttribute }) closable = true
  @Input() footer?: TemplateRef<void> | null

  get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])
  }

  get isVisible(): boolean {
    return this.visible
  }

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  open(): void {
    this.visible = true
    this.changeDetectorRef.markForCheck()
  }

  close(): void {
    this.visible = false
    this.closed.emit()
    this.changeDetectorRef.markForCheck()
  }
}
