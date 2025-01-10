import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  Output,
} from '@angular/core'
import { CssPipe } from '../../shared/pipes/css.pipe'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { TextSelectComponentDefinition, TextSelectState } from './text-select'

// https://javascript.info/selection-range

const INDEX = 'data-select-index'
const HIGHLIGHT = 'highlight-state'

@Component({
  selector: 'wc-text-select',
  templateUrl: 'text-select.component.html',
  styleUrls: ['text-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(TextSelectComponentDefinition)
export class TextSelectComponent implements WebComponentHooks<TextSelectState> {
  @Input() state!: TextSelectState
  @Output() stateChange = new EventEmitter<TextSelectState>()

  get container() {
    const native = this.el.nativeElement
    let container = native.firstElementChild as HTMLElement
    if (container.tagName !== 'DIV') {
      container = document.createElement('div')
      native.insertBefore(container, native.firstElementChild)
    }
    container.className = 'cursor-pointer'
    if (this.state.mode === 'free') {
      container.className = 'cursor-text'
    }
    container.className += this.state.disabled ? ' disabled' : ''
    return container
  }

  constructor(
    readonly injector: Injector,
    private readonly el: ElementRef<HTMLElement>,
    private readonly cssPipe: CssPipe
  ) {}

  onChangeState() {
    switch (this.state.mode) {
      case 'units':
        this.renderModeUnits()
        break
      case 'free':
        this.renderModeFree()
        break
      default:
        this.renderModeRegex()
        break
    }
    this.highlightSelections()
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.state.mode === 'free') {
      this.createSelectionFromMouse()
    } else {
      this.createSelectionFromEvent(event)
    }
  }

  private createSelectionFromMouse() {
    const selection = (window.getSelection || document.getSelection)()
    // selection.anchorNode is a textContent and parentElement is the span
    const startNode = selection?.anchorNode?.parentElement
    const endNode = selection?.focusNode?.parentElement

    const idx1 = Number.parseInt(startNode?.getAttribute(INDEX) || '', 10)
    const idx2 = Number.parseInt(endNode?.getAttribute(INDEX) || '', 10)
    if (Number.isNaN(idx1) || Number.isNaN(idx2)) {
      return
    }

    const startIndex = Math.min(idx1, idx2)
    const endIndex = Math.max(idx1, idx2)

    const selections = this.state.selections
    for (let i = 0; i < selections.length; i++) {
      const item = selections[i]
      if (typeof item.position === 'object') {
        const range = item.position as number[]
        const startIndexInRange = startIndex >= range[0] && startIndex <= range[1]
        const endIndexInRange = endIndex >= range[0] && startIndex <= range[1]
        if (startIndexInRange || endIndexInRange) {
          selections.splice(i, 1)
          return
        }
      }
    }
    this.state.isFilled = true
    this.state.selections.push({
      position: [startIndex, endIndex],
    })
  }

  private createSelectionFromEvent(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) return

    const container = this.container

    let node: HTMLElement = event.target
    if (container.isSameNode(node) || !container.contains(node)) return

    // try to find the first parent of target that has ${INDEX} attribute
    while (node.getAttribute(INDEX) == null) {
      node = node.parentElement as HTMLElement
      if (node == null) return

      if (node.isSameNode(container))
        // limit search to container boundary.
        return
    }

    const index = Number.parseInt(node.getAttribute(INDEX) || '', 10)

    if (!Number.isNaN(index)) {
      let i = 0
      for (const item of this.state.selections) {
        if (item.position === index) {
          this.state.selections.splice(i, 1)
          return
        }
        i++
      }
      this.state.isFilled = true
      this.state.selections.push({
        position: index,
      })
    }
  }

  private renderModeFree() {
    this.container.innerHTML = this.state.text.trim()
    let index = 0
    const walk = (node: Element) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const wrapper = document.createElement('span')
        for (const c of node.textContent as string) {
          if (c === '\n') continue
          const span = document.createElement('span')
          span.innerText = c
          span.setAttribute(INDEX, (index++).toString())
          wrapper.appendChild(span)
        }
        node.parentElement?.replaceChild(wrapper, node)
        return
      }
      Array.from(node.childNodes).forEach((childNode) => walk(childNode as Element))
    }
    walk(this.container)
  }

  private renderModeUnits() {
    let index = 0
    this.container.innerHTML = this.state.text.replace(/\{([^}]+?)\}/gm, (_, group) => {
      return `<span ${INDEX}="${index++}">${group}</span>`
    })
  }

  private renderModeRegex() {
    let index = 0
    this.container.innerHTML = this.state.text.trim().replace(new RegExp(this.state.regex || '', 'gm'), (match) => {
      return `<span ${INDEX}="${index++}">${match}</span>`
    })
  }

  private highlightRange(i: number, j: number, classes?: string) {
    const container = this.container
    const selectedText: string[] = []
    for (let index = i; index <= j; index++) {
      const node = container.querySelector(`[${INDEX}="${index}"]`)
      if (node) {
        node.className = classes || HIGHLIGHT
        selectedText.push(node.innerHTML)
      }
    }
    return selectedText.join('')
  }

  private highlightSelections() {
    const container = this.container
    container.querySelectorAll(`[${INDEX}]`).forEach((node) => {
      node.className = ''
    })

    this.state.selections.forEach((item) => {
      const classes = this.cssPipe.transform(item.css, 'class')
      if (typeof item.position === 'number') {
        const node = container.querySelector(`[${INDEX}="${item.position}"]`)
        if (node) {
          node.className = classes || HIGHLIGHT
          if (item.content !== node.textContent) {
            item.content = node.textContent as string
          }
        }
      } else {
        const content = this.highlightRange(item.position[0], item.position[1], classes)
        if (item.content !== content) {
          item.content = content
        }
      }
    })
  }
}
