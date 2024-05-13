import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface BubbleItem {
  id: string
  css?: string
  content?: string
  audio?: string
  image?: string
  state: 'checked' | 'unchecked' | 'error' | 'disabled'
}

export interface PairBubbleItem {
  item1: BubbleItem
  item2: BubbleItem
}

export interface BindedBubblesState extends IWebComponent {
  items: PairBubbleItem[]
  numberPairToShow: number
  mode: 'shuffle' | 'ordered'
}

export const BindedBubblesComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'BindedBubbles',
  icon: 'assets/images/components/forms/binded-bubbles/binded-bubbles.svg', //FIXME
  selector: 'wc-binded-bubbles',
  description: 'Permets de choisir 2 propositions parmi une liste.',
  fullDescriptionUrl: 'assets/docs/components/forms/binded-bubbles/binded-bubbles.md',
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
        enum: ['ordered'],
        default: 'ordered',
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
          audio: null,
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
    ],

    numberPairToShow: 3,
  },
})
