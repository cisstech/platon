import { Automaton } from './automaton'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface AutomatonEditorState extends IWebComponent {
  height: number
  automaton: Automaton
}

export const AutomatonEditorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'AutomatonEditor',
  icon: 'assets/images/components/forms/automaton-editor/automaton-editor.svg',
  selector: 'wc-automaton-editor',
  description: "Permets de saisir un automate à l'aide d'un éditeur graphique.",
  fullDescriptionUrl: 'assets/docs/components/forms/automaton-editor/automaton-editor.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
      height: {
        type: 'number',
        default: 500,
        description: "La hauteur de l'éditeur en px.",
      },
      automaton: {
        type: 'object',
        default: {},
        description: 'Automate dessiner.',
      },
    },
  },
  showcase: {},
})
