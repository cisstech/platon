import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface GraphViewerState extends IWebComponent {
  graph: string
}

export const GraphViewerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'GraphViewer',
  selector: 'wc-graph-viewer',
  description: "Permets d'afficher un graph.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['graph'],
    properties: {
      graph: {
        type: 'string',
        default: '',
        description: 'Le graph à dessiner au format dot.',
      },
    },
  },
  showcase: {
    graph: stripIndent`
        digraph G {
            a;
            b;
            c -> d;
            a -> c;
        }
        `,
  },
})
