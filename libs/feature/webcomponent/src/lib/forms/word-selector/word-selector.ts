import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface WordSelectorState extends IWebComponent {
  words: string[]
  selectedWords: string[]
  lengthWords: number
}

export const WordSelectorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'WordSelector',
  icon: 'assets/images/components/forms/word-selector/word-selector.svg',
  selector: 'wc-word-selector',
  description: 'Permet de sélectionner et organiser des mots pour former une phrase.',
  fullDescriptionUrl: 'assets/docs/components/forms/word-selector/word-selector.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'WordSelector',
    properties: {
      words: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: [],
        description: 'La liste initiale des mots disponibles.',
      },
      selectedWords: {
        type: 'array',
        items: {
          type: 'string',
        },
        default: [],
        description: "La liste des mots construits par l'utilisateur.",
      },
    },
  },
  showcase: {
    selectedWords: [],
    words: ["C'", 'est', 'mon', 'ami', 'il', 'vient', "d'", 'Australie', 'et', 'il', 'est', 'très', 'sympa'],
  },
})
