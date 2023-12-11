import { Component, EventEmitter, OnDestroy, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { TemplatePortal } from '@angular/cdk/portal'

@Component({
  selector: 'wc-matrix-resizer',
  templateUrl: './matrix-resizer.component.html',
  styleUrls: ['./matrix-resizer.component.scss'],
})
export class MatrixResizerComponent implements OnDestroy {
  private readonly width = 10
  private resizer?: OverlayRef

  readonly cells = Array.from(
    {
      length: this.width * this.width,
    },
    (_, k) => k
  )

  cols = 0
  rows = 0

  @Output()
  resized = new EventEmitter<{ cols: number; rows: number }>()

  @ViewChild('template', { read: TemplateRef })
  template!: TemplateRef<unknown>

  constructor(private readonly overlay: Overlay, private readonly container: ViewContainerRef) {}

  ngOnDestroy() {
    this.resizer?.dispose()
  }

  isOn(index: number) {
    const cols = index % this.width
    const rows = Math.floor(index / this.width)
    return rows <= this.rows && cols <= this.cols
  }

  hover(index: number) {
    this.cols = index % this.width
    this.rows = Math.floor(index / this.width)
  }

  done(index: number) {
    this.resized.emit({
      cols: (index % this.width) + 1,
      rows: Math.floor(index / this.width) + 1,
    })
    this.close()
  }

  open(event: MouseEvent) {
    const { x, y } = event
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ])
    this.resizer = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    })
    this.resizer.attach(new TemplatePortal(this.template, this.container))
  }

  close() {
    this.resizer?.dispose()
    this.resizer = undefined
  }

  trackBy(index: number) {
    return index
  }
}
