import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {
  BrowserJsPlumbInstance,
  Connection,
  Endpoint,
  EVENT_CONNECTION,
  EVENT_CONNECTION_CLICK,
  EVENT_CONNECTION_DETACHED,
  newInstance,
  ready,
} from '@jsplumb/browser-ui'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import { MatchListComponentDefinition, MatchListItem, MatchListState } from './match-list'

@Component({
  selector: 'wc-match-list',
  templateUrl: 'match-list.component.html',
  styleUrls: ['match-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(MatchListComponentDefinition)
export class MatchListComponent implements OnInit, AfterViewChecked, OnDestroy, WebComponentHooks<MatchListState> {
  @Input() state!: MatchListState
  @Output() stateChange = new EventEmitter<MatchListState>()

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLElement>

  private width = 0
  private height = 0
  private jsPlumb!: BrowserJsPlumbInstance
  private selectedPoints: string[] = []

  get sources() {
    return this.state.nodes.filter((e) => e.type === 'source')
  }

  get targets() {
    return this.state.nodes.filter((e) => e.type === 'target')
  }

  constructor(readonly injector: Injector, readonly changeDetector: WebComponentChangeDetectorService) {}

  async ngOnInit() {
    this.jsPlumb = newInstance({
      container: this.container.nativeElement,
      connectionsDetachable: false,
      endpoint: {
        type: 'Dot',
        options: {
          radius: 6,
        },
      },
      connector: 'StateMachine',
      paintStyle: {
        strokeWidth: 4,
        stroke: '#456',
      },
      hoverPaintStyle: {
        stroke: '#FF4500',
      },
      endpointHoverStyle: {
        stroke: '#FF4500',
        fill: '#FF4500',
      },
      connectionOverlays: [
        {
          type: 'Arrow',
          options: { width: 16, length: 16, location: 0.98, id: 'arrow' },
        },
      ],
      dragOptions: { cursor: 'pointer', zIndex: 2000 },
    })
    await new Promise<void>((resolve) => {
      ready(() => {
        this.addListeners()
        resolve()
      })
    })
  }

  ngAfterViewChecked() {
    const { offsetWidth, offsetHeight } = this.container.nativeElement
    if (this.width !== offsetWidth || this.height !== offsetHeight) {
      if (this.width !== 0 && this.height !== 0) {
        this.jsPlumb?.repaintEverything()
      }
    }
    this.width = offsetWidth
    this.height = offsetHeight
  }

  ngOnDestroy() {
    this.jsPlumb?.reset()
  }

  onChangeState() {
    this.jsPlumb.batch(() => {
      const changes = this.changeDetector.changes(this)
      if (changes.includes('nodes')) {
        this.jsPlumb.selectEndpoints().each((endpoint) => {
          // If endpoint is not in the list of nodes, delete it
          if (!this.state.nodes.find((node) => node.id === endpoint.uuid)) {
            this.jsPlumb.deleteEndpoint(endpoint)
          }
        })
      }

      // Create new endpoints
      this.renderEndPoints()

      if (changes.includes('links')) {
        this.jsPlumb.connections.forEach((connection) => {
          if (
            // If connection is not in the list of links, delete it
            !this.state.links.find((link) => link.source === connection.sourceId && link.target === connection.targetId)
          ) {
            this.jsPlumb.deleteConnection(connection)
          }
        })
      }

      // Create new connections
      this.renderConnections()

      if (changes.includes('disabled')) {
        if (this.state.disabled) {
          this.jsPlumb.setSuspendEvents(true)
          this.jsPlumb.selectEndpoints().each((endpoint) => {
            endpoint.maxConnections = endpoint.connections.length
          })
        } else {
          this.jsPlumb.setSuspendEvents(false)
          this.jsPlumb.selectEndpoints().each((endpoint) => {
            endpoint.maxConnections = -1
          })
        }
      }

      this.selectedPoints = []
      this.unselectPoints()
    })
  }

  trackBy(index: number, item: MatchListItem) {
    return item.id || index
  }

  private renderEndPoints() {
    this.state.nodes
      .filter((node) => !this.jsPlumb.getEndpoint(node.id))
      .forEach((node) => {
        const element = document.getElementById(node.id)
        if (!element) return

        const endpoint = this.jsPlumb.addEndpoint(element, {
          uuid: node.id,
          source: node.type === 'source',
          target: node.type === 'target',
          anchor: node.type === 'source' ? 'Right' : 'Left',
          maxConnections: -1,
        })
        element.addEventListener('click', () => {
          if (!this.state.disabled) this.selectPoint(endpoint, node.id)
        })
      })
  }

  private renderConnections() {
    this.state.links
      .filter(
        (link) => !this.jsPlumb.connections.find((conn) => conn.sourceId == link.source && conn.targetId == link.target)
      )
      .forEach((link) => {
        const source = this.jsPlumb.getEndpoint(link.source)
        const target = this.jsPlumb.getEndpoint(link.target)
        if (!source || !target) return
        this.jsPlumb?.connect({
          source,
          target,
          anchors: ['Right', 'Left'],
          cssClass: link.css,
        })
      })
  }

  private addListeners() {
    this.jsPlumb.bind(EVENT_CONNECTION_CLICK, (connection) => {
      this.jsPlumb?.deleteConnection(connection)
    })
    this.jsPlumb.bind(EVENT_CONNECTION, (info) => {
      this.onCreateConnection(info.connection)
    })
    this.jsPlumb.bind(EVENT_CONNECTION_DETACHED, (info) => {
      this.onRemoveConnection(info.connection)
    })
  }

  private selectPoint(endpoint: Endpoint, id: string) {
    if (this.selectedPoints.includes(id)) {
      endpoint.removeClass('selected')
      this.selectedPoints.splice(this.selectedPoints.indexOf(id), 1)
      return
    }
    endpoint.addClass('selected')
    this.selectedPoints.push(id)
    if (this.selectedPoints.length >= 2) {
      const source = this.selectedPoints.find((e) => this.sources.find((s) => s.id === e))
      const target = this.selectedPoints.find((e) => this.targets.find((t) => t.id === e))
      if (!source || !target) {
        const top = this.selectedPoints[1]
        this.unselectPoints()
        this.selectPoint(this.jsPlumb.getEndpoint(top), top)
      } else {
        if (this.state.links.find((e) => e.source === source && e.target === target)) {
          this.unselectPoints()
          return
        }
        this.unselectPoints()
        const sourceEndpoint = this.jsPlumb.getEndpoint(source)
        const targetEndpoint = this.jsPlumb.getEndpoint(target)
        this.jsPlumb.connect({
          source: sourceEndpoint,
          target: targetEndpoint,
        })
      }
    }
  }

  private unselectPoints() {
    this.selectedPoints.forEach((id) => {
      const endpoint = this.jsPlumb.getEndpoint(id)
      endpoint.removeClass('selected')
    })
    this.selectedPoints = []
  }

  private indexOfConnection(connection: Connection) {
    const links = this.state.links
    for (let i = 0; i < this.state.links.length; i++) {
      const link = links[i]
      if (link.source === connection.sourceId && link.target === connection.targetId) {
        return i
      }
    }
    return -1
  }

  private onCreateConnection(connection: Connection) {
    const index = this.indexOfConnection(connection)
    if (index !== -1) return
    this.changeDetector
      .ignore(this, () => {
        this.state.links.push({
          source: connection.sourceId,
          target: connection.targetId,
        })
      })
      .catch(console.error)
  }

  private onRemoveConnection(connection: Connection) {
    const index = this.indexOfConnection(connection)
    if (index !== -1) {
      this.changeDetector
        .ignore(this, () => {
          this.state.links.splice(index, 1)
        })
        .catch(console.error)
    }
  }
}
