import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface CodeViewerState extends IWebComponent {
  code: string
  lines: string
  language: string
  highlights: string
}

export const CodeViewerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'CodeViewer',
  selector: 'wc-code-viewer',
  description:
    "Composant d'affichage de code source avec coloration syntaxique, numérotation et surlignage de lignes. Idéal pour les exercices d'analyse de code, de débogage, d'explication d'algorithmes ou pour présenter des exemples de programmation avec mise en évidence des sections importantes.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'CodeViewer',
    required: ['code', 'language'],
    properties: {
      code: { type: 'string', default: '', description: 'Code à afficher.' },
      lines: {
        type: 'string',
        default: '',
        description: 'Numéros de ligne à afficher.',
      },
      language: {
        type: 'string',
        default: 'plaintext',
        description: 'Langage du code.',
      },
      highlights: {
        type: 'string',
        default: '',
        description: 'Lignes à surligner.',
      },
    },
  },
  showcase: {
    language: 'python',
    lines: '1',
    highlights: '4 7 9-10',
    code: stripIndent`
        # This program adds two numbers

        num1 = 1.5
        num2 = 6.3

        # Add two numbers
        sum = num1 + num2

        # Display the sum
        print('The sum of {0} and {1} is {2}'.format(num1, num2, sum))
        `,
  },
})
