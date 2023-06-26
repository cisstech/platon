import { Provider } from '@angular/core';
import { NgeElementDef } from '@cisstech/nge/elements';

import { WEB_COMPONENT_DEFINITIONS } from './web-component';

import { InputBoxComponentDefinition } from './forms/input-box/input-box';
import { CodeViewerComponentDefinition } from './widgets/code-viewer/code-viewer';
import { CodeEditorComponentDefinition } from './forms/code-editor/code-editor';
import { RadioGroupComponentDefinition } from './forms/radio-group/radio-group';
import { CheckboxGroupComponentDefinition } from './forms/checkbox-group/checkbox-group';
import { SortListComponentDefinition } from './forms/sort-list/sort-list';
import { TextSelectComponentDefinition } from './forms/text-select/text-select';
import { AutomatonEditorComponentDefinition } from './forms/automaton-editor/automaton-editor';
import { MatchListComponentDefinition } from './forms/match-list/match-list';
import { MatrixComponentDefinition } from './forms/matrix/matrix';
import { PickerComponentDefinition } from './forms/picker/picker';
import { MathLiveComponentDefinition } from './forms/math-live/math-live';
import { JsxComponentDefinition } from './forms/jsx/jsx';
import { AutomatonViewerComponentDefinition } from './widgets/automaton-viewer/automaton-viewer';
import { GraphViewerComponentDefinition } from './widgets/graph-viewer/graph-viewer';
import { MarkdownComponentDefinition } from './widgets/markdown/markdown';
import { DragDropComponentDefinition } from './forms/drag-drop/drag-drop';
import { FeedbackComponentDefinition } from './widgets/feedback/feedback';
import { ChartViewerComponentDefinition } from './widgets/chart-viewer/chart-viewer';

export const WEB_COMPONENTS_BUNDLES: NgeElementDef[] = [
  {
    selector: 'wc-automaton-editor',
    module: () =>
      import(
        /* webpackChunkName: "wc-automaton-editor" */ './forms/automaton-editor/automaton-editor.module'
      ).then((m) => m.AutomatonEditorModule),
  },
  {
    selector: 'wc-automaton-viewer',
    module: () =>
      import(
        /* webpackChunkName: "wc-automaton-viewer" */ './widgets/automaton-viewer/automaton-viewer.module'
      ).then((m) => m.AutomatonViewerModule),
  },
  {
    selector: 'wc-checkbox-group',
    module: () =>
      import(
        /* webpackChunkName: "wc-checkbox-group" */ './forms/checkbox-group/checkbox-group.module'
      ).then((m) => m.CheckboxGroupModule),
  },
  {
    selector: 'wc-code-editor',
    module: () =>
      import(
        /* webpackChunkName: "wc-code-editor" */ './forms/code-editor/code-editor.module'
      ).then((m) => m.CodeEditorModule),
  },
  {
    selector: 'wc-code-viewer',
    module: () =>
      import(
        /* webpackChunkName: "wc-code-viewer" */ './widgets/code-viewer/code-viewer.module'
      ).then((m) => m.CodeViewerModule),
  },
  {
    selector: 'wc-graph-viewer',
    module: () =>
      import(
        /* webpackChunkName: "wc-graph-viewer" */ './widgets/graph-viewer/graph-viewer.module'
      ).then((m) => m.GraphViewerModule),
  },
  {
    selector: 'wc-chart-viewer',
    module: () =>
      import(
        /* webpackChunkName: "wc-graph-viewer" */ './widgets/chart-viewer/chart-viewer.module'
      ).then((m) => m.ChartViewerModule),
  },
  {
    selector: 'wc-input-box',
    module: () =>
      import(
        /* webpackChunkName: "wc-input-box" */ './forms/input-box/input-box.module'
      ).then((m) => m.InputBoxModule),
  },
  {
    selector: 'wc-jsx',
    module: () =>
      import(/* webpackChunkName: "wc-jsx" */ './forms/jsx/jsx.module').then(
        (m) => m.JsxModule
      ),
  },
  {
    selector: 'wc-markdown',
    module: () =>
      import(
        /* webpackChunkName: "wc-markdown" */ './widgets/markdown/markdown.module'
      ).then((m) => m.MarkdownModule),
  },
  {
    selector: 'wc-match-list',
    module: () =>
      import(
        /* webpackChunkName: "wc-match-list" */ './forms/match-list/match-list.module'
      ).then((m) => m.MatchListModule),
  },
  {
    selector: 'wc-math-live',
    module: () =>
      import(
        /* webpackChunkName: "wc-math-live" */ './forms/math-live/math-live.module'
      ).then((m) => m.MathLiveModule),
  },
  {
    selector: 'wc-matrix',
    module: () =>
      import(
        /* webpackChunkName: "wc-matrix" */ './forms/matrix/matrix.module'
      ).then((m) => m.MatrixModule),
  },
  {
    selector: 'wc-picker',
    module: () =>
      import(
        /* webpackChunkName: "wc-picker" */ './forms/picker/picker.module'
      ).then((m) => m.PickerModule),
  },
  {
    selector: 'wc-radio-group',
    module: () =>
      import(
        /* webpackChunkName: "wc-radio-group" */ './forms/radio-group/radio-group.module'
      ).then((m) => m.RadioGroupModule),
  },
  {
    selector: 'wc-sort-list',
    module: () =>
      import(
        /* webpackChunkName: "wc-sort-list" */ './forms/sort-list/sort-list.module'
      ).then((m) => m.SortListModule),
  },
  {
    selector: 'wc-text-select',
    module: () =>
      import(
        /* webpackChunkName: "wc-text-select" */ './forms/text-select/text-select.module'
      ).then((m) => m.TextSelectModule),
  },
  {
    selector: 'wc-drag-drop',
    module: () =>
      import(
        /* webpackChunkName: "wc-drag-drop" */ './forms/drag-drop/drag-drop.module'
      ).then((m) => m.DragDropModule),
  },
  {
    selector: 'wc-feedback',
    module: () =>
      import(
        /* webpackChunkName: "wc-feedback" */ './widgets/feedback/feedback.module'
      ).then((m) => m.FeedbackModule),
  },
];

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
    useValue: ChartViewerComponentDefinition,
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
];
