import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { GraphViewerComponentDefinition, GraphViewerState } from './graph-viewer'

@Component({
  selector: 'wc-graph-viewer',
  templateUrl: 'graph-viewer.component.html',
  styleUrls: ['graph-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(GraphViewerComponentDefinition)
export class GraphViewerComponent implements WebComponentHooks<GraphViewerState> {
  @Input() state!: GraphViewerState
  constructor(readonly injector: Injector) {}
}
