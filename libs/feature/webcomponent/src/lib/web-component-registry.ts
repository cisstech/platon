import { Provider } from '@angular/core'
import { NgeElementDef } from '@cisstech/nge/elements'

import { WEB_COMPONENT_DEFINITIONS } from './web-component'

import { InputBoxComponentDefinition } from './forms/input-box/input-box'
import { CodeViewerComponentDefinition } from './widgets/code-viewer/code-viewer'
import { CodeEditorComponentDefinition } from './forms/code-editor/code-editor'
import { RadioGroupComponentDefinition } from './forms/radio-group/radio-group'
import { CheckboxGroupComponentDefinition } from './forms/checkbox-group/checkbox-group'
import { SortListComponentDefinition } from './forms/sort-list/sort-list'
import { TextSelectComponentDefinition } from './forms/text-select/text-select'
import { AutomatonEditorComponentDefinition } from './forms/automaton-editor/automaton-editor'
import { MatchListComponentDefinition } from './forms/match-list/match-list'
import { MatrixComponentDefinition } from './forms/matrix/matrix'
import { PickerComponentDefinition } from './forms/picker/picker'
import { MathLiveComponentDefinition } from './forms/math-live/math-live'
import { JsxComponentDefinition } from './forms/jsx/jsx'
import { BindedBubblesComponentDefinition } from './forms/binded-bubbles/binded-bubbles'
import { AutomatonViewerComponentDefinition } from './widgets/automaton-viewer/automaton-viewer'
import { GraphViewerComponentDefinition } from './widgets/graph-viewer/graph-viewer'
import { MarkdownComponentDefinition } from './widgets/markdown/markdown'
import { DragDropComponentDefinition } from './forms/drag-drop/drag-drop'
import { FeedbackComponentDefinition } from './widgets/feedback/feedback'
import { PresenterComponentDefinition } from './widgets/presenter/presenter'
import { ChartViewerPiesComponentDefinition } from './widgets/chart-viewer-pies/chart-viewer-pies'
import { ChartViewerBarsComponentDefinition } from './widgets/chart-viewer-bars/chart-viewer-bars'
import { ChartViewerRadarComponentDefinition } from './widgets/chart-viewer-radar/chart-viewer-radar'
import { FoldableFeedbackComponentDefinition } from './widgets/foldable-feedback/foldable-feedback'
import { WordSelectorComponentDefinition } from './forms/word-selector/word-selector'

export const WEB_COMPONENTS_BUNDLES: NgeElementDef[] = [
  {
    selector: 'wc-automaton-editor',
    module: () =>
      import(/* webpackChunkName: "wc-automaton-editor" */ './forms/automaton-editor/automaton-editor.module').then(
        (m) => m.AutomatonEditorModule
      ),
  },
  {
    selector: 'wc-automaton-viewer',
    module: () =>
      import(/* webpackChunkName: "wc-automaton-viewer" */ './widgets/automaton-viewer/automaton-viewer.module').then(
        (m) => m.AutomatonViewerModule
      ),
  },
  {
    selector: 'wc-checkbox-group',
    module: () =>
      import(/* webpackChunkName: "wc-checkbox-group" */ './forms/checkbox-group/checkbox-group.module').then(
        (m) => m.CheckboxGroupModule
      ),
  },
  {
    selector: 'wc-code-editor',
    module: () =>
      import(/* webpackChunkName: "wc-code-editor" */ './forms/code-editor/code-editor.module').then(
        (m) => m.CodeEditorModule
      ),
  },
  {
    selector: 'wc-code-viewer',
    module: () =>
      import(/* webpackChunkName: "wc-code-viewer" */ './widgets/code-viewer/code-viewer.module').then(
        (m) => m.CodeViewerModule
      ),
  },
  {
    selector: 'wc-graph-viewer',
    module: () =>
      import(/* webpackChunkName: "wc-graph-viewer" */ './widgets/graph-viewer/graph-viewer.module').then(
        (m) => m.GraphViewerModule
      ),
  },
  {
    selector: 'wc-input-box',
    module: () =>
      import(/* webpackChunkName: "wc-input-box" */ './forms/input-box/input-box.module').then((m) => m.InputBoxModule),
  },
  {
    selector: 'wc-jsx',
    module: () => import(/* webpackChunkName: "wc-jsx" */ './forms/jsx/jsx.module').then((m) => m.JsxModule),
  },
  {
    selector: 'wc-binded-bubbles',
    module: () =>
      import(/* webpackChunkName: "wc-binded-bubbles" */ './forms/binded-bubbles/binded-bubbles.module').then(
        (m) => m.BindedBubblesModule
      ),
  },
  {
    selector: 'wc-word-selector',
    module: () =>
      import(/* webpackChunkName: "wc-word-selector" */ './forms/word-selector/word-selector.module').then(
        (m) => m.WordSelectorModule
      ),
  },
  {
    selector: 'wc-markdown',
    module: () =>
      import(/* webpackChunkName: "wc-markdown" */ './widgets/markdown/markdown.module').then((m) => m.MarkdownModule),
  },
  {
    selector: 'wc-match-list',
    module: () =>
      import(/* webpackChunkName: "wc-match-list" */ './forms/match-list/match-list.module').then(
        (m) => m.MatchListModule
      ),
  },
  {
    selector: 'wc-math-live',
    module: () =>
      import(/* webpackChunkName: "wc-math-live" */ './forms/math-live/math-live.module').then((m) => m.MathLiveModule),
  },
  {
    selector: 'wc-matrix',
    module: () =>
      import(/* webpackChunkName: "wc-matrix" */ './forms/matrix/matrix.module').then((m) => m.MatrixModule),
  },
  {
    selector: 'wc-picker',
    module: () =>
      import(/* webpackChunkName: "wc-picker" */ './forms/picker/picker.module').then((m) => m.PickerModule),
  },
  {
    selector: 'wc-radio-group',
    module: () =>
      import(/* webpackChunkName: "wc-radio-group" */ './forms/radio-group/radio-group.module').then(
        (m) => m.RadioGroupModule
      ),
  },
  {
    selector: 'wc-sort-list',
    module: () =>
      import(/* webpackChunkName: "wc-sort-list" */ './forms/sort-list/sort-list.module').then((m) => m.SortListModule),
  },
  {
    selector: 'wc-text-select',
    module: () =>
      import(/* webpackChunkName: "wc-text-select" */ './forms/text-select/text-select.module').then(
        (m) => m.TextSelectModule
      ),
  },
  {
    selector: 'wc-drag-drop',
    module: () =>
      import(/* webpackChunkName: "wc-drag-drop" */ './forms/drag-drop/drag-drop.module').then((m) => m.DragDropModule),
  },
  {
    selector: 'wc-feedback',
    module: () =>
      import(/* webpackChunkName: "wc-feedback" */ './widgets/feedback/feedback.module').then((m) => m.FeedbackModule),
  },
  {
    selector: 'wc-presenter',
    module: () =>
      import(/* webpackChunkName: "wc-presenter" */ './widgets/presenter/presenter.module').then(
        (m) => m.PresenterModule
      ),
  },
  {
    selector: 'wc-chart-viewer-pies',
    module: () =>
      import(
        /* webpackChunkName: "wc-chart-viewer-pies" */ './widgets/chart-viewer-pies/chart-viewer-pies.module'
      ).then((m) => m.ChartViewerPiesModule),
  },
  {
    selector: 'wc-chart-viewer-bars',
    module: () =>
      import(
        /* webpackChunkName: "wc-chart-viewer-bars" */ './widgets/chart-viewer-bars/chart-viewer-bars.module'
      ).then((m) => m.ChartViewerBarsModule),
  },
  {
    selector: 'wc-chart-viewer-radar',
    module: () =>
      import(
        /* webpackChunkName: "wc-chart-viewer-radar" */ './widgets/chart-viewer-radar/chart-viewer-radar.module'
      ).then((m) => m.ChartViewerRadarModule),
  },
  {
    selector: 'wc-foldable-feedback',
    module: () =>
      import(
        /* webpackChunkName: "wc-foldable-feedback" */ './widgets/foldable-feedback/foldable-feedback.module'
      ).then((m) => m.FoldableFeedbackModule),
  },

  // INTERNALS
  {
    selector: 'wc-editorjs-viewer',
    module: () =>
      import(/* webpackChunkName: "wc-editorjs-viewer" */ './internals/editorjs-viewer/editorjs-viewer.module').then(
        (m) => m.EditorjsViewerModule
      ),
  },
]

export const WEB_COMPONENTS_REGISTRY: Provider[] = [
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: AutomatonEditorComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: AutomatonViewerComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: CheckboxGroupComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: CodeEditorComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: CodeViewerComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: GraphViewerComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: InputBoxComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: JsxComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: BindedBubblesComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: WordSelectorComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: MarkdownComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: MatchListComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: MathLiveComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: MatrixComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: PickerComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: RadioGroupComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: SortListComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: TextSelectComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: DragDropComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: FeedbackComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: PresenterComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: ChartViewerPiesComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: ChartViewerBarsComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: ChartViewerRadarComponentDefinition,
  },
  {
    provide: WEB_COMPONENT_DEFINITIONS,
    multi: true,
    useValue: FoldableFeedbackComponentDefinition,
  },
]
