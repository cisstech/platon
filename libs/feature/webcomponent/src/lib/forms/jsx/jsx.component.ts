/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { ResourceLoaderService } from '@cisstech/nge/services'
import { firstValueFrom } from 'rxjs'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import { JsxComponentDefinition, JsxState } from './jsx'

declare const JXG: any

@Component({
  selector: 'wc-jsx',
  templateUrl: 'jsx.component.html',
  styleUrls: ['jsx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(JsxComponentDefinition)
export class JsxComponent implements OnInit, OnDestroy, WebComponentHooks<JsxState> {
  private static NEXT_ID = 0
  private board?: any

  readonly boardId = 'jsx_graph' + ++JsxComponent.NEXT_ID

  @Input() state!: JsxState
  @Output() stateChange = new EventEmitter<JsxState>()

  constructor(
    readonly injector: Injector,
    readonly resourceLoader: ResourceLoaderService,
    readonly changeDetector: WebComponentChangeDetectorService
  ) {}

  async ngOnInit() {
    await firstValueFrom(
      this.resourceLoader.loadAllSync([
        ['script', 'assets/vendors/jsxgraph/jsxgraphcore.js'],
        ['style', 'assets/vendors/jsxgraph/jsxgraph.css'],
      ])
    )

    JXG.Options = JXG.merge(JXG.Options, {
      board: {
        showCopyright: false,
        keepAspectRatio: true,
      },
      elements: {
        highlight: false,
        showInfobox: false,
      },
      point: {
        showInfobox: false,
      },
    })
    this.createBoard()
  }

  ngOnDestroy() {
    this.destroyBoard()
  }

  onChangeState() {
    const changes = this.changeDetector.changes(this)
    if (changes.includes('script') || changes.includes('attributes')) {
      this.createBoard()
    }

    if (changes.includes('points')) {
      this.writePoints()
    }

    if (this.state.disabled) {
      this.board.removeEventHandlers()
    } else if (!this.board.hasPointerHandlers) {
      this.board.addEventHandlers()
    }
  }

  private createBoard() {
    this.destroyBoard()
    this.board = JXG.JSXGraph.initBoard(this.boardId, {
      axis: true,
      ...(this.state.attributes || {}),
    })

    this.board.on('update', () => {
      this.changeDetector.batch(this, () => {
        this.readPoints()
      })
    })

    const code = decodeURIComponent(this.state.script)
    const exec = new Function('board', code)
    exec(this.board)
    this.readPoints()
  }

  private destroyBoard() {
    if (this.board) {
      JXG.JSXGraph.freeBoard(this.board)
    }
  }

  private readPoints() {
    this.state.points = {}
    if (this.board.objectsList) {
      for (const o of this.board.objectsList) {
        if (JXG.isPoint(o) && o.name) {
          this.state.points[o.name] = {
            x: o.X(),
            y: o.Y(),
          }
        }
      }
    }
  }

  private writePoints() {
    let updateNeeded = false
    const names = Object.keys(this.state.points)
    for (const name of names) {
      const object = this.board.objectsList.find((o: any) => {
        return JXG.isPoint(o) && o.name === name
      })
      if (object) {
        const point = this.state.points[name]
        const array = [point.x, point.y]
        object.setPosition(JXG.COORDS_BY_USER, array)
        updateNeeded = true
      }
    }

    if (updateNeeded) {
      this.board.fullUpdate()
    }
  }
}
