/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {
  BrowserJsPlumbInstance,
  newInstance,
  Connection as JsPlumbConnection,
  ready,
  EVENT_DRAG_STOP,
  DragStopPayload,
  BeforeDropParams,
  EVENT_CONNECTION_CLICK,
  INTERCEPT_BEFORE_DROP,
  LabelOverlay,
} from '@jsplumb/browser-ui'
import { Subscription } from 'rxjs'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import { AUTOMATON_EDITOR_ACTIONS, AutomatonEditorAction, AutomatonEditorActionContext } from './actions/action'
import { ActionDeleteStateProvider } from './actions/states/delete-state'
import { ActionRenameStateProvider } from './actions/states/rename-state'
import { ActionSetAcceptingProvider } from './actions/states/set-accepting'
import { ActionSetInitialProvider } from './actions/states/set-initial'
import { ActionSetNonAcceptingProvider } from './actions/states/set-non-accepting'
import { ActionSetNonInitialProvider } from './actions/states/set-non-initial'
import { ActionDeleteTransitionProvider } from './actions/transitions/delete-transition'
import { ActionRenameTransitionProvider } from './actions/transitions/rename-transition'
import { State, Transition } from './automaton'
import { AutomatonEditorComponentDefinition, AutomatonEditorState } from './automaton-editor'
import { AutomatonEditorService } from './automaton-editor.service'

declare type Connection = JsPlumbConnection & { canvas?: HTMLElement }

export const EPSILON = '$'
export const FOCUSED_CLASS = 'focused'
export const LABEL_CLASS = 'automaton-state__label'
export const STATE_CLASS = 'automaton-state'
export const END_POINT_CLASS = 'automaton-state__endpoint'
export const TRANSITION_CLASS = 'automaton-transition'
export const FINAL_STATE_CLASS = 'automaton-state--final'
export const TRANSITION_OVERLAY = 'transition'
export const INITIAL_STATE_CLASS = 'automaton-state--initial'

const BASIC_CONNECTION = {
  anchor: 'Continuous' as const,
  connector: 'StateMachine' as const,
}

@Component({
  selector: 'wc-automaton-editor',
  templateUrl: 'automaton-editor.component.html',
  styleUrls: ['automaton-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    AutomatonEditorService,
    ActionSetInitialProvider,
    ActionSetNonInitialProvider,
    ActionSetAcceptingProvider,
    ActionSetNonAcceptingProvider,
    ActionRenameStateProvider,
    ActionDeleteStateProvider,
    ActionRenameTransitionProvider,
    ActionDeleteTransitionProvider,
  ],
})
@WebComponent(AutomatonEditorComponentDefinition)
export class AutomatonEditorComponent implements OnInit, OnDestroy, WebComponentHooks<AutomatonEditorState> {
  private readonly subs: Subscription[] = []
  private readonly context: AutomatonEditorActionContext = {
    state: undefined,
    transition: undefined,
  }

  private zoom = 1.0
  private jsp!: BrowserJsPlumbInstance

  @Input() state!: AutomatonEditorState
  @Output() stateChange = new EventEmitter<AutomatonEditorState>()

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLElement>

  actions: AutomatonEditorAction[] = []

  private get canvas() {
    return this.container.nativeElement.querySelector('.automaton-editor-canvas')
  }

  constructor(
    readonly injector: Injector,
    readonly editor: AutomatonEditorService,
    readonly changeDetector: WebComponentChangeDetectorService,
    @Inject(AUTOMATON_EDITOR_ACTIONS)
    readonly editorActions: AutomatonEditorAction[]
  ) {}

  ngOnInit() {
    this.jsp = newInstance({
      endpoint: {
        type: 'Blank',
        options: { radius: 2 },
      },
      connector: {
        type: 'StateMachine',
        options: {
          curviness: 10,
        },
      },
      paintStyle: { stroke: '#5c96bc', strokeWidth: 2 },
      hoverPaintStyle: {
        stroke: '#1e8151',
        strokeWidth: 2,
      },
      connectionOverlays: [
        {
          type: 'Arrow',
          options: {
            location: 1,
            id: 'arrow',
            length: 14,
            foldback: 0.8,
            width: 14,
          },
        },
        {
          type: 'Label',
          options: {
            label: '$',
            id: TRANSITION_OVERLAY,
            cssClass: TRANSITION_CLASS,
            location: 0.4,
          },
        },
      ],
      container: this.canvas || undefined,
    })

    this.jsp.bind(EVENT_DRAG_STOP, (dragStopPayload: DragStopPayload) => {
      this.changeDetector
        .ignore(this, () => {
          const el = dragStopPayload.elements.at(0)
          if (!el) {
            return
          }
          this.editor.moveState(dragStopPayload.el.id, el.pos.x, el.pos.y)
        })
        .catch(console.error)
    })

    this.jsp.registerConnectionType('basic', BASIC_CONNECTION)

    return new Promise<void>((resolve) => {
      ready(() => {
        this.addListeners()
        resolve()
      })
    })
  }

  ngOnDestroy() {
    this.removeListeners()
  }

  onChangeState() {
    this.editor.sync(this.state)
    this.jsp.reset()
    this.jsp.getContainer().innerHTML = ''
    this.jsp.batch(() => {
      this.editor.forEachState(this.renderEndpoint.bind(this))
      this.editor.forEachTransition(this.createConnection.bind(this))
    })
    this.unfocus()
    this.state.isFilled = false
  }

  run(action: AutomatonEditorAction) {
    this.changeDetector
      .ignore(this, () => {
        return action.run(this.context)
      })
      .catch(console.error)
  }

  zoomIn(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    this.zoom += 0.1
    if (this.zoom >= 1) {
      this.zoom = 1
    }
    this.setZoom(this.zoom)
  }

  zoomOut(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    this.zoom -= 0.1
    if (this.zoom <= 0.2) {
      this.zoom = 0.2
    }
    this.setZoom(this.zoom)
  }

  private addListeners() {
    this.jsp.bind(EVENT_CONNECTION_CLICK, this.onClickConnection.bind(this))
    this.jsp.bind(INTERCEPT_BEFORE_DROP, this.onWillCreateConnection.bind(this))

    this.jsp.on(this.container.nativeElement, 'click', this.onClickContainer.bind(this))
    this.jsp.on(this.container.nativeElement, 'dblclick', this.onDblClickContainer.bind(this))

    // CREATE EVENTS
    this.subs.push(this.editor.onCreateState.subscribe(this.renderEndpoint.bind(this)))
    this.subs.push(this.editor.onCreateTransition.subscribe(this.renderConnection.bind(this)))
    this.subs.push(
      this.editor.onCreateInitialState.subscribe((stateName) => {
        const node = this.findEndpoint(stateName)
        if (node) {
          node.classList.remove(INITIAL_STATE_CLASS)
          node.classList.add(INITIAL_STATE_CLASS)
          this.focus(node)
        }
      })
    )
    this.subs.push(
      this.editor.onCreateAcceptingState.subscribe((stateName) => {
        const node = this.findEndpoint(stateName)
        if (node) {
          node.classList.remove(FINAL_STATE_CLASS)
          node.classList.add(FINAL_STATE_CLASS)
          this.focus(node)
        }
      })
    )

    // REMOVE EVENTS
    this.subs.push(
      this.editor.onRemoveInitialState.subscribe((stateName) => {
        const node = this.findEndpoint(stateName)
        if (node) {
          node.classList.remove(INITIAL_STATE_CLASS)
          this.focus(node)
        }
      })
    )
    this.subs.push(
      this.editor.onRemoveAcceptingState.subscribe((stateName) => {
        const node = this.findEndpoint(stateName)
        if (node) {
          node.classList.remove(FINAL_STATE_CLASS)
          this.focus(node)
        }
      })
    )

    this.subs.push(
      this.editor.onRemoveState.subscribe((e: State) => {
        const node = this.jsp.getEndpoint(e.uuid)
        this.jsp.deleteEndpoint(node)
        const el = this.findEndpoint(e.name)
        el?.parentElement?.removeChild(el)
        if (el) this.jsp.removeAllEndpoints(el)
        this.unfocus()
      })
    )
    this.subs.push(
      this.editor.onRemoveTransition.subscribe((e) => {
        const connection = this.findConnection(e)
        if (connection) this.jsp.deleteConnection(connection)
        this.unfocus()
      })
    )

    // RENAME EVENTS
    this.subs.push(
      this.editor.onRenameState.subscribe((e) => {
        const { newName } = e
        const node = this.findEndpoint(e.oldName)
        if (node) {
          node.id = newName
          const label = node.querySelector('.' + LABEL_CLASS)
          if (label) {
            label.innerHTML = newName
          }
          this.jsp.revalidate(node)
          this.focus(node)
        }
      })
    )
    this.subs.push(
      this.editor.onRenameTransition.subscribe((e) => {
        const connection = this.findConnection(e)
        if (connection) {
          const overlay: any = connection.getOverlay(TRANSITION_OVERLAY)
          overlay.setLabel(e.symbols.join(','))
          this.focus(connection)
        }
      })
    )
  }

  private removeListeners() {
    this.jsp?.reset()
    this.jsp?.off(this.container.nativeElement, 'click', this.onClickContainer.bind(this))
    this.jsp?.off(this.container.nativeElement, 'dblclick', this.onDblClickContainer.bind(this))
    this.subs.forEach((s) => s.unsubscribe())
    this.subs.splice(0)
  }

  private setZoom(zoom: number, _transformOrigin: [number, number] = [0.5, 0.5]) {
    const el = this.canvas
    if (!el) return
    el.setAttribute('style', `transform: scale(${zoom})`)
    this.jsp.setZoom(zoom, true)
    this.jsp.repaintEverything()
  }

  private renderEndpoint(stateName: string) {
    const node = document.createElement('div')
    node.id = stateName
    node.className = STATE_CLASS
    node.innerHTML = `
      <div class="${LABEL_CLASS}">${stateName}</div>
      <div class="${END_POINT_CLASS}"></div>
    `

    const { x, y } = this.editor.findPosition(stateName)
    node.style.left = x + 'px'
    node.style.top = y + 'px'

    // Add click event listeners to focus on the node
    node.onclick = (ev: MouseEvent) => {
      ev.stopPropagation()
      this.changeDetector.ignore(this, () => this.focus(node)).catch(console.error)
    }

    if (this.editor.isInitial(stateName)) {
      node.classList.add(INITIAL_STATE_CLASS)
    }

    if (this.editor.isAccepting(stateName)) {
      node.classList.add(FINAL_STATE_CLASS)
    }

    // Append the node to the canvas
    this.canvas?.appendChild(node)

    // Manage the node with jsPlumb, make it draggable and connectable
    this.jsp.manage(node)
    this.jsp.addEndpoint(node, {
      uuid: stateName,
      ...BASIC_CONNECTION,
    })

    // Add source selector for draggable elements that can start connections
    this.jsp.addSourceSelector(`.${STATE_CLASS} .${END_POINT_CLASS}`, {
      endpoint: {
        type: 'Dot',
        options: { radius: 2 },
      },
      anchor: 'Continuous',
      maxConnections: -1,
      extract: { 'data-connector-type': 'basic' },
      connectorStyle: { stroke: '#5c96bc', strokeWidth: 2 },
      allowLoopback: true, // Allow connections back to the same node
    })

    // Add a target selector instead of makeTarget
    this.jsp.addTargetSelector(`.${STATE_CLASS}`, {
      endpoint: {
        type: 'Dot',
        options: { radius: 2 },
      },
      anchor: 'Continuous',
      allowLoopback: true,
    })

    // this.jsp.draggable(node)
    this.jsp.revalidate(node)
  }

  private onClickConnection(conn: JsPlumbConnection, originalEvent: MouseEvent) {
    originalEvent.stopPropagation()
    this.changeDetector
      .ignore(this, () => {
        this.unfocus()
        this.focus(conn)
      })
      .catch(console.error)
  }

  private onClickContainer(_e: MouseEvent) {
    this.unfocus()
  }

  private createEndpoint(name: string, x?: number, y?: number) {
    x = x ?? Math.random() * this.container.nativeElement.offsetWidth
    y = y ?? Math.random() * this.container.nativeElement.offsetHeight
    this.editor.addState(name, x * this.zoom, y * this.zoom)
  }

  private onDblClickContainer(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!(target instanceof HTMLElement)) {
      return
    }
    if (!target.isSameNode(this.container.nativeElement) && !target.isSameNode(this.canvas)) {
      return
    }

    this.changeDetector
      .ignore(this, () => {
        this.createEndpoint(this.editor.stateName(), e.offsetX, e.offsetY)
      })
      .catch(console.error)
  }

  private onWillCreateConnection(params: BeforeDropParams): boolean {
    const sourceName = params.connection.source.id
    const targetName = params.connection.target.id
    this.changeDetector
      .ignore(this, () => this.editor.addTransition({ fromState: sourceName, toState: targetName, symbols: [EPSILON] }))
      .catch(console.error)
    return this.findConnection({ fromState: sourceName, toState: targetName, symbols: [] }) === undefined
  }

  private renderConnection(transition: Transition) {
    setTimeout(() => {
      const connection = this.findConnection(transition)
      if (connection) {
        const overlay: LabelOverlay = connection.getOverlay<LabelOverlay>(TRANSITION_OVERLAY)
        overlay.setLabel(transition.symbols.join(','))
      }
    })
  }

  private createConnection(transition: Transition) {
    const from = this.findEndpoint(transition.fromState)
    const to = this.findEndpoint(transition.toState)
    if (!from || !to) {
      return
    }

    const connection = this.jsp.connect({
      source: from,
      target: to,
      ...BASIC_CONNECTION,
    })
    const overlay: LabelOverlay = connection.getOverlay<LabelOverlay>(TRANSITION_OVERLAY)
    overlay.setLabel(transition.symbols.join(','))
  }

  private findEndpoint(name: string): HTMLElement | null {
    return this.container.nativeElement.querySelector("[id='" + name + "']")
  }

  private findConnection(transition: Transition): Connection | undefined {
    const from = this.findEndpoint(transition.fromState)
    const to = this.findEndpoint(transition.toState)
    if (!from || !to) {
      return
    }
    return this.jsp
      .select({
        source: from,
        target: to,
      })
      .get(0)
  }

  private focus(e: HTMLElement | Connection) {
    this.unfocus()
    if (!e) {
      return
    }

    if (e instanceof HTMLElement) {
      e.classList.remove(FOCUSED_CLASS)
      e.classList.add(FOCUSED_CLASS)
      this.context.state = {
        uuid: e.getAttribute('data-jtk-managed') || e.id,
        name: e.id,
      }
    } else {
      e.removeClass(FOCUSED_CLASS)
      e.addClass(FOCUSED_CLASS)
      this.context.transition = this.editor.findTransition((tr) => {
        return tr.fromState === e.source.id && tr.toState === e.target.id
      })
    }
    this.actions = this.editorActions.filter((act) => {
      return act.condition(this.context)
    })
  }

  private unfocus() {
    if (this.context.state) {
      const node = this.findEndpoint(this.context.state.name)
      node?.classList?.remove(FOCUSED_CLASS)
    }

    if (this.context.transition) {
      const connection = this.findConnection(this.context.transition)
      connection?.removeClass?.(FOCUSED_CLASS)
      connection?.canvas?.classList?.remove(FOCUSED_CLASS)
    }

    this.actions = []
    this.context.state = undefined
    this.context.transition = undefined
    this.changeDetector.ignore(this, () => this.stateChange.emit(this.state)).catch(console.error)
  }
}
