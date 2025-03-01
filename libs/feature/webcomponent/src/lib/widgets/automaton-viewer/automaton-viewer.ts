import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface AutomatonViewerState extends IWebComponent {
  automaton: string
}

export const AutomatonViewerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'AutomatonViewer',
  selector: 'wc-automaton-viewer',
  description: "Permets d'afficher un automate.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['automaton'],
    properties: {
      automaton: {
        type: 'string',
        default: '',
        description: 'Automate à afficher.',
      },
    },
  },
  showcase: {
    automaton: stripIndent`
        #states
        s0
        s1
        s2
        #initials
        s0
        #accepting
        s2
        #alphabet
        a
        b
        #transitions
        s0:a>s1
        s1:a>s1
        s1:b>s2
        `,
  },
})
