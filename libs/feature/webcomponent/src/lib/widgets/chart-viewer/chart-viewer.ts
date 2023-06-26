import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes,
} from '../../web-component';

export interface ChartViewerState extends IWebComponent {
  code: string;
  lines: string;
  language: string;
  highlights: string;
}

export const ChartViewerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'ChartViewer',
  icon: 'assets/images/components/forms/code-editor/code-editor.svg',
  selector: 'wc-chart-viewer',
  description:
    "Permets d'afficher un graph de type spécifier",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'ChartViewer',
    required: ['chart'],
    properties: {
      chart: { 
        type: 'object', 
        default: '{}', 
        description: 'Chart à afficher.' 
      }
    },
  },
  showcase: {
    chart: {
      
    }
  },
});
