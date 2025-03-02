import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface WordSelectorState extends IWebComponent {
  words: string[]
  selectedWords: string[]
  lengthWords: number
}

export const WordSelectorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'WordSelector',
  selector: 'wc-word-selector',
  description:
    "Interface interactive pour sélectionner et organiser des mots afin de construire des phrases ou expressions. Idéal pour les exercices linguistiques comme la construction de phrases, l'apprentissage de langues étrangères, la mise en ordre syntaxique, ou pour des exercices de logique où l'ordre des éléments est important.",
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
