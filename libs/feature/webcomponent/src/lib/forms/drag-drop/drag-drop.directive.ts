import { AfterContentInit, Directive, ElementRef, EventEmitter, OnDestroy, Output, Renderer2 } from '@angular/core'

export interface DragDropEvent {
  source: string
  destination: string
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[dragNdrop]',
})
export class DragDropDirective implements OnDestroy, AfterContentInit {
  private static NODE_ID = 0
  private readonly events: (() => void)[] = []

  readonly id: string

  @Output()
  dropped = new EventEmitter<DragDropEvent>()

  constructor(private readonly el: ElementRef<HTMLElement>, private readonly renderer: Renderer2) {
    this.id = 'dnd-' + ++DragDropDirective.NODE_ID
  }

  ngAfterContentInit(): void {
    const node: HTMLElement = this.el.nativeElement
    this.setDraggable(node)
    this.setDroppable(node)
  }

  ngOnDestroy(): void {
    this.events.forEach((e) => e())
  }

  private setDraggable(node: HTMLElement) {
    this.renderer.setAttribute(node, 'id', this.id)
    this.renderer.setProperty(node, 'draggable', true)
    const dragstart = (e: DragEvent) => {
      if (!e.dataTransfer) return false
      e.dataTransfer.effectAllowed = 'move'

      const x = this.el.nativeElement.offsetWidth / 2
      const y = this.el.nativeElement.offsetHeight / 2
      e.dataTransfer.setDragImage(this.el.nativeElement, x, y)

      e.dataTransfer.setData('dnd-id', node.id)
      this.renderer.addClass(node, 'dnd-drag')
      return false
    }
    node.addEventListener('dragstart', dragstart, false)
    const dragend = (_: DragEvent) => {
      this.renderer.removeClass(node, 'dnd-drag')
      return false
    }
    node.addEventListener('dragend', dragend, false)
  }

  private setDroppable(node: HTMLElement) {
    const dragover = (e: DragEvent) => {
      if (!e.dataTransfer) return false
      e.dataTransfer.dropEffect = 'move'
      e.preventDefault()
      this.renderer.addClass(node, 'dnd-over')
      return false
    }
    this.addListener(node, 'dragover', dragover)

    const dragenter = () => {
      this.renderer.removeClass(node, 'dnd-over')
      return false
    }
    this.addListener(node, 'dragenter', dragenter)

    const dragleave = () => {
      this.renderer.removeClass(node, 'dnd-over')
      return false
    }
    this.addListener(node, 'dragleave', dragleave)

    const drop = (e: DragEvent) => {
      if (!e.dataTransfer) {
        return false
      }

      e.preventDefault()
      e.stopPropagation()

      this.renderer.removeClass(node, 'dnd-over')

      const dndId = e.dataTransfer.getData('dnd-id')
      if (dndId) {
        this.dropped.emit({
          source: dndId,
          destination: this.id,
        })
      }
      return false
    }
    this.addListener(node, 'drop', drop)
  }

  private addListener(node: any, event: string, handler: any) {
    this.renderer.listen(node, event, handler)
    this.events.push(() => {
      node.removeEventListener(event, handler, false)
    })
  }
}
