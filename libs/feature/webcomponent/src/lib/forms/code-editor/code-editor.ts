import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface CodeEditorState extends IWebComponent {
  code: string
  height: number
  tabSize: number
  language: string
  quickSuggestions: boolean
}

export const CodeEditorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'CodeEditor',
  selector: 'wc-code-editor',
  description: 'Un éditeur de code proposant de la coloration syntaxique.',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'CodeEditor',
    properties: {
      code: {
        type: 'string',
        default: '',
        description: "Le contenu de l'éditeur.",
      },
      height: {
        type: 'number',
        default: 400,
        description: "Le hauteur de l'éditeur en px.",
      },
      tabSize: {
        type: 'number',
        default: 4,
        description: "Le nombre d'espaces correspondant à une tabulation.",
      },
      language: {
        type: 'string',
        default: 'plaintext',
        description: 'Le langage pour la coloration syntaxique.',
      },
      quickSuggestions: {
        type: 'boolean',
        default: true,
        description: "Activer l'auto-complétion des mots?",
      },
    },
  },
  showcase: {
    language: 'python',
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
