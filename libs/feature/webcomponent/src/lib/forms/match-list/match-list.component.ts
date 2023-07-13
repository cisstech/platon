import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { Connection, Endpoint, EndpointOptions, jsPlumb, jsPlumbInstance } from 'jsplumb'
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

  @ViewChild('container', { static: true })
  container!: ElementRef<HTMLElement>

  private width = 0
  private height = 0
  private jsPlumb!: jsPlumbInstance
  private selectedPoints: Endpoint[] = []

  get sources() {
    return this.state.nodes.filter((e) => e.type === 'source')
  }

  get targets() {
    return this.state.nodes.filter((e) => e.type === 'target')
  }

  constructor(readonly injector: Injector, readonly changeDetector: WebComponentChangeDetectorService) {}

  async ngOnInit() {
    this.jsPlumb = jsPlumb.getInstance({
      Container: this.container.nativeElement,
      ConnectionsDetachable: false,
      Endpoint: ['Dot', { radius: 6 }],
      Connector: 'StateMachine',
      PaintStyle: {
        strokeWidth: 4,
        stroke: '#456',
      },
      HoverPaintStyle: {
        stroke: '#FF4500',
      },
      EndpointHoverStyle: {
        stroke: '#FF4500',
        fill: '#FF4500',
      },
      ConnectionOverlays: [['Arrow', { width: 16, length: 16, location: 0.98, id: 'arrow' }]],
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
    })
    await new Promise<void>((resolve) => {
      this.jsPlumb.ready(() => {
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
      this.jsPlumb.reset(true)
      this.jsPlumb.setSuspendEvents(this.state.disabled)
      this.renderEndPoints()
      this.renderConnections()
    })
  }

  trackBy(index: number, item: MatchListItem) {
    return item.id || index
  }

  private renderEndPoints() {
    this.state.nodes.forEach((node) => {
      this.jsPlumb?.addEndpoint(node.id, {
        id: node.id,
        isSource: node.type === 'source',
        isTarget: node.type === 'target',
        anchor: node.type === 'source' ? 'Right' : 'Left',
        maxConnections: this.state.disabled ? 0 : -1,
      })
    })
  }

  private renderConnections() {
    this.state.links.forEach((link) => {
      if (!link.source || !link.target) return
      this.jsPlumb?.connect({
        source: link.source,
        target: link.target,
        anchors: ['RightMiddle', 'LeftMiddle'],
        cssClass: link.css,
      })
    })
  }

  private addListeners() {
    this.jsPlumb.bind('click', (connection) => {
      this.jsPlumb?.deleteConnection(connection)
    })
    this.jsPlumb.bind('connection', (info) => {
      this.onCreateConnection(info.connection)
    })
    this.jsPlumb.bind('connectionDetached', (info) => {
      this.onRemoveConnection(info.connection)
    })
    this.jsPlumb.bind('endpointClick', (info) => {
      const point = (<unknown>info) as Endpoint
      this.selectPoint(point)
      if (this.selectedPoints.length >= 2) {
        const source = this.selectedPoints.find((e) => ((<unknown>e) as EndpointOptions).isSource)
        const target = this.selectedPoints.find((e) => ((<unknown>e) as EndpointOptions).isTarget)
        if (!source || !target) {
          const top = this.selectedPoints[1]
          this.unselectPoints()
          this.selectPoint(top)
        } else {
          this.unselectPoints()
          this.state.links.push({
            source: source.getElement().id,
            target: target.getElement().id,
          })
        }
      }
    })
  }

  private selectPoint(point: Endpoint) {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const canvas = (<any>point).canvas as HTMLElement
    canvas.classList.remove('selected')
    canvas.classList.add('selected')
    this.selectedPoints.push(point)
  }

  private unselectPoints() {
    this.selectedPoints.forEach((point) => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const canvas = (<any>point).canvas as HTMLElement
      canvas.classList.remove('selected')
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
    this.changeDetector.ignore(this, () => {
      this.state.links.push({
        source: connection.sourceId,
        target: connection.targetId,
      })
    })
  }

  private onRemoveConnection(connection: Connection) {
    const index = this.indexOfConnection(connection)
    if (index !== -1) {
      this.changeDetector.ignore(this, () => {
        this.state.links.splice(index, 1)
      })
    }
  }
}
