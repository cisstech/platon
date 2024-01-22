import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { DragDropComponentDefinition, DragDropState } from './drag-drop'
import { DragDropDirective, DragDropEvent } from './drag-drop.directive'
import { DragDropService } from './drag-drop.service'

@Component({
  selector: 'wc-drag-drop',
  templateUrl: 'drag-drop.component.html',
  styleUrls: ['drag-drop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(DragDropComponentDefinition)
export class DragDropComponent implements OnInit, OnDestroy, WebComponentHooks<DragDropState> {
  @Input() state!: DragDropState
  @Output() stateChange = new EventEmitter<DragDropState>()

  @ViewChild(DragDropDirective, { static: true })
  directive!: DragDropDirective

  constructor(readonly injector: Injector, readonly dragdrop: DragDropService) {}

  ngOnInit(): void {
    this.dragdrop.register(this.directive.id, this)
  }

  ngOnDestroy(): void {
    if (this.directive) {
      this.dragdrop.unregister(this.directive.id)
    }
  }

  dropped(event: DragDropEvent): void {
    const { source, destination } = event
    if (source !== destination) {
      const src = this.dragdrop.get(source) as DragDropComponent
      const dst = this.dragdrop.get(destination) as DragDropComponent

      if (src.state.group !== dst.state.group) return

      if (src === dst) return

      if (dst.state.draggable) {
        if (!src.state.draggable && src.state.content === dst.state.content) {
          // undo drop
          src.state.content = ''
        }
        return
      }

      if (!src.state.draggable && src.state.content && dst.state.content) {
        const content = src.state.content
        src.state.content = dst.state.content
        dst.state.content = content
      } else {
        dst.state.content = src.state.content
      }
    }
  }

  clear() {
    if (!this.state.draggable) {
      this.state.content = ''
    }
  }
}
