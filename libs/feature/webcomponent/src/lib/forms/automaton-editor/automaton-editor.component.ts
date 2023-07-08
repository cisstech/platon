/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import {
  Connection as JsPlumbConnection,
  OnConnectionBindInfo,
  jsPlumb,
  jsPlumbInstance,
} from 'jsplumb'
import { Subscription } from 'rxjs'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import {
  AUTOMATON_EDITOR_ACTIONS,
  AutomatonEditorAction,
  AutomatonEditorActionContext,
} from './actions/action'
import { ActionDeleteStateProvider } from './actions/states/delete-state'
import { ActionRenameStateProvider } from './actions/states/rename-state'
import { ActionSetAcceptingProvider } from './actions/states/set-accepting'
import { ActionSetInitialProvider } from './actions/states/set-initial'
import { ActionSetNonAcceptingProvider } from './actions/states/set-non-accepting'
import { ActionSetNonInitialProvider } from './actions/states/set-non-initial'
import { ActionDeleteTransitionProvider } from './actions/transitions/delete-transition'
import { ActionRenameTransitionProvider } from './actions/transitions/rename-transition'
import { Transition } from './automaton'
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
export class AutomatonEditorComponent
  implements OnInit, OnDestroy, WebComponentHooks<AutomatonEditorState>
{
  private readonly subs: Subscription[] = []
  private readonly context: AutomatonEditorActionContext = {
    state: undefined,
    transition: undefined,
  }

  private zoom = 1.0
  private jsp!: jsPlumbInstance

  @Input() state!: AutomatonEditorState

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
    this.jsp = jsPlumb.getInstance({
      Endpoint: ['Dot', { radius: 2 }],
      Connector: 'StateMachine',
      HoverPaintStyle: {
        stroke: '#1e8151',
        strokeWidth: 2,
      },
      ConnectionOverlays: [
        [
          'Arrow',
          {
            location: 1,
            id: 'arrow',
            length: 14,
            foldback: 0.8,
          },
        ],
        [
          'Label',
          {
            label: 'transition',
            id: TRANSITION_OVERLAY,
            cssClass: TRANSITION_CLASS,
          },
        ],
      ],
      Container: this.canvas,
    })

    this.jsp.registerConnectionType('basic', {
      anchor: 'Continuous',
      connector: 'StateMachine',
    })

    return new Promise<void>((resolve) => {
      this.jsp.ready(() => {
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
    this.jsp.reset(true)
    this.jsp.getContainer().innerHTML = ''
    this.jsp.batch(() => {
      this.editor.forEachState(this.renderEndpoint.bind(this))
      this.editor.forEachTransition(this.renderConnection.bind(this))
    })
    this.unfocus()
  }

  run(action: AutomatonEditorAction) {
    this.changeDetector.ignore(this, () => {
      return action.run(this.context)
    })
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
    this.jsp.bind('click', this.onClickConnection.bind(this))
    this.jsp.bind('beforeDrop', this.onWillCreateConnection.bind(this))

    jsPlumb.on(this.container.nativeElement, 'click', this.onClickContainer.bind(this))
    jsPlumb.on(this.container.nativeElement, 'dblclick', this.onDblClickContainer.bind(this))

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
      this.editor.onRemoveState.subscribe((e) => {
        this.jsp.remove(e)
        this.unfocus()
      })
    )
    this.subs.push(
      this.editor.onRemoveTransition.subscribe((e) => {
        this.jsp.deleteConnection(this.findConnection(e))
        this.unfocus()
      })
    )

    // RENAME EVENTS
    this.subs.push(
      this.editor.onRenameState.subscribe((e) => {
        const { oldName, newName } = e
        const node = this.findEndpoint(e.oldName)
        if (node) {
          node.id = newName
          const label = node.querySelector('.' + LABEL_CLASS)
          if (label) {
            label.innerHTML = newName
          }
          this.jsp.setIdChanged(oldName, newName)
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
    jsPlumb?.off(this.container.nativeElement, 'mousedown', this.onClickContainer.bind(this))
    jsPlumb?.off(this.container.nativeElement, 'dblclick', this.onDblClickContainer.bind(this))
    this.subs.forEach((s) => s.unsubscribe())
  }

  private renderEndpoint(name: string) {
    const node = document.createElement('div')
    node.id = name
    node.className = STATE_CLASS
    node.innerHTML = `
        <div class="${LABEL_CLASS}">${name}</div>
        <div class="${END_POINT_CLASS}"></div>
        `

    const { x, y } = this.editor.findPosition(name)
    node.style.left = x + 'px'
    node.style.top = y + 'px'

    node.onclick = node.ontouchstart = () => {
      this.changeDetector.ignore(this, () => this.focus(node))
    }

    if (this.editor.isInitial(name)) {
      node.classList.add(INITIAL_STATE_CLASS)
    }

    if (this.editor.isAccepting(name)) {
      node.classList.add(FINAL_STATE_CLASS)
    }

    this.jsp.getContainer().appendChild(node)

    this.jsp.draggable(node, {
      drag: (e) => {
        this.changeDetector.ignore(this, () => {
          this.editor.moveState(node.id, e.pos[0], e.pos[1])
        })
      },
    })

    this.jsp.makeSource(node, {
      filter: `.${END_POINT_CLASS}`,
      anchor: 'Continuous',
      connectorStyle: {
        stroke: '#5c96bc',
        strokeWidth: 2,
        outlineStroke: 'transparent',
        outlineWidth: 4,
      },
      connectionType: 'basic',
      maxConnections: -1,
    })

    this.jsp.makeTarget(node, {
      anchor: 'Continuous',
      dropOptions: { hoverClass: 'dragHover' },
      allowLoopback: true,
    })
  }

  private createEndpoint(name: string, x?: number, y?: number) {
    x = x ?? Math.random() * this.container.nativeElement.offsetWidth
    y = y ?? Math.random() * this.container.nativeElement.offsetHeight
    this.editor.addState(name, x * this.zoom, y * this.zoom)
  }

  private createConnection(transition: Transition) {
    return this.editor.addTransition(transition)
  }

  private renderConnection(transition: Transition) {
    // setTimeout is required here since when a connection is created from beforeDrop,
    // it is added to the state object before jsplumb.
    setTimeout(() => {
      const connection = this.findConnection(transition)
      if (connection) {
        const overlay: any = connection.getOverlay(TRANSITION_OVERLAY)
        overlay.setLabel(transition.symbols.join(','))
      }
    })
  }

  private focus(e: HTMLElement | Connection) {
    this.unfocus()
    if (!e) {
      return
    }

    if (e instanceof HTMLElement) {
      e.classList.remove(FOCUSED_CLASS)
      e.classList.add(FOCUSED_CLASS)
      this.context.state = e.id
    } else {
      const canvas = e.canvas
      canvas?.classList.remove(FOCUSED_CLASS)
      canvas?.classList.add(FOCUSED_CLASS)
      this.context.transition = this.editor.findTransition((tr) => {
        return tr.fromState === e.sourceId && tr.toState === e.targetId
      })
    }
    this.actions = this.editorActions.filter((act) => {
      return act.condition(this.context)
    })
  }

  private unfocus() {
    if (this.context.state) {
      const node = this.findEndpoint(this.context.state)
      node?.classList?.remove(FOCUSED_CLASS)
    }

    if (this.context.transition) {
      const connection = this.findConnection(this.context.transition)
      connection?.canvas?.classList?.remove(FOCUSED_CLASS)
    }

    this.actions = []
    this.context.state = undefined
    this.context.transition = undefined
  }

  private onClickContainer(e: MouseEvent) {
    const node = e.target as HTMLElement
    if (node.classList.contains(STATE_CLASS)) {
      this.changeDetector.ignore(this, () => this.focus(node))
    } else if (node.isSameNode(this.container.nativeElement)) {
      this.changeDetector.ignore(this, () => this.unfocus())
    }
  }

  private onDblClickContainer(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!(target instanceof HTMLElement)) {
      return
    }

    if (!target.isSameNode(this.container.nativeElement) && !target.isSameNode(this.canvas)) {
      return
    }

    this.changeDetector.ignore(this, () => {
      this.createEndpoint(this.editor.stateName(), e.offsetX, e.offsetY)
    })
  }

  private onClickConnection(connection: Connection) {
    this.changeDetector.ignore(this, () => {
      this.focus(connection)
    })
  }

  private onWillCreateConnection(info: OnConnectionBindInfo) {
    return this.changeDetector.ignore(this, () => {
      return this.createConnection({
        fromState: info.connection.sourceId,
        toState: info.connection.targetId,
        symbols: [EPSILON],
      })
    })
  }

  private findEndpoint(name: string): HTMLElement | null {
    return this.container.nativeElement.querySelector('#' + name)
  }

  private findConnection(transition: Transition) {
    return this.jsp
      .getAllConnections()
      .find(
        (e) => e.sourceId === transition.fromState && e.targetId === transition.toState
      ) as Connection
  }

  private setZoom(zoom: number, transformOrigin?: [number, number]) {
    transformOrigin = transformOrigin || [0.5, 0.5]
    const el = this.jsp.getContainer() as HTMLElement
    el.style.overflow = 'visible'
    el.style.border = '1px solid #F5F5F5'
    const prefix = ['webkit', 'moz', 'ms', 'o']
    const scale = 'scale(' + zoom + ')'
    const oString = transformOrigin[0] * 100 + '% ' + transformOrigin[1] * 100 + '%'

    for (let i = 0; i < prefix.length; i++) {
      ;(<any>el.style)[prefix[i] + 'Transform'] = scale
      ;(<any>el.style)[prefix[i] + 'TransformOrigin'] = oString
    }

    el.style['transform'] = scale
    el.style['transformOrigin'] = oString

    this.jsp.setZoom(zoom)
  }
}
