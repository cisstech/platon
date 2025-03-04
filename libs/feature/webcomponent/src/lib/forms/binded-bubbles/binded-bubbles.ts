import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface BubbleItem {
  id: string
  css?: string
  content?: string
  audio?: string
  image?: string
  state: 'checked' | 'unchecked' | 'error' | 'disabled' | 'achieved'
}

export interface PairBubbleItem {
  item1: BubbleItem
  item2: BubbleItem
}

export interface BindedBubblesState extends IWebComponent {
  items: PairBubbleItem[]
  numberPairToShow: number
  nbError: number
  errors: PairBubbleItem[]
  mode: 'shuffle' | 'ordered'
  timeout: number
}

export const BindedBubblesComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'BindedBubbles',
  selector: 'wc-binded-bubbles',
  description:
    "Jeu interactif de correspondance entre paires d'éléments, présentés sous forme de bulles à sélectionner. Parfait pour les exercices ludiques d'apprentissage de vocabulaire, de correspondances entre termes et définitions, de relations entre concepts, ou pour des activités de mémorisation comme les jeux de cartes mémoire.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'BindedBubbles',
    properties: {
      items: {
        type: 'array',
        default: [],
        description: 'La liste des propositions.',
        items: {
          type: 'object',
          properties: {
            item1: {
              type: 'object',
              description: 'Contenu du premier item',
              properties: { content: { type: 'string' } },
            },
            item2: {
              type: 'object',
              description: 'Contenu du deuxième item',
              properties: { content: { type: 'string' } },
            },
          },
        },
      },
      numberPairToShow: {
        type: 'number',
        description: 'Nombre de propositions à afficher.',
        default: 3,
      },
      mode: {
        type: 'string',
        description: 'Mode de jeu',
        enum: ['ordered', 'shuffle'],
        default: 'ordered',
      },
      timeout: {
        type: 'number',
        description: "Temps d'attente avant d'afficher la prochaine bonne proposition. (en millisecondes)",
        default: 1000,
      },
      nbError: {
        type: 'number',
        description: "Nombre d'erreurs",
        default: 0,
      },
      errors: {
        type: 'array',
        description: 'Liste des erreurs',
        default: [],
        items: {
          type: 'object',
          properties: {
            item1: {
              type: 'object',
              description: 'Contenu du premier item',
              properties: { content: { type: 'string' } },
            },
            item2: {
              type: 'object',
              description: 'Contenu du deuxième item',
              properties: { content: { type: 'string' } },
            },
          },
        },
      },
    },
    required: ['items'],
  },
  showcase: {
    items: [
      // PairBubbleItem
      {
        item1: {
          content: 'Bonjour',
        },
        item2: {
          content: 'Hello',
        },
      },
      {
        item1: {
          content: 'Bienvenue',
        },
        item2: {
          content: 'Welcome',
        },
      },

      {
        item1: {
          content: 'Merci',
        },
        item2: {
          content: 'Thank you',
        },
      },

      {
        item1: {
          content: 'Pas de problème',
        },

        item2: {
          content: 'No problem',
        },
      },

      {
        item1: {
          content: 'Au revoir',
        },
        item2: {
          content: 'Goodbye',
        },
      },

      {
        item1: {
          content: 'De rien',
        },
        item2: {
          content: 'You are welcome',
        },
      },

      {
        item1: {
          content: 'Oui',
        },
        item2: {
          content: 'Yes',
        },
      },

      {
        item1: {
          content: 'Non',
        },
        item2: {
          content: 'No',
        },
      },
    ],
    numberPairToShow: 3,
  },
})
