import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface BubbleItem {
  id: string
  css?: string
  content?: string
  audio?: string
  image?: string
  state: 'checked' | 'unchecked' | 'error' | 'disabled';
}

export interface PairBubbleItem {
  item1: BubbleItem
  item2: BubbleItem

}

export interface BindedBubblesState extends IWebComponent {
  items: PairBubbleItem[]
  numberPairToShow: number
  mode : 'shuffle' | 'ordered'
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
          type: 'array',
          required: ['id'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', description: 'Identifiant de la proposition.' },
            state : { type: 'string', enum: ['checked', 'unchecked', 'error', 'disabled'], description: 'Etat de la proposition.', default: 'unchecked'},
            content: { type: 'string', description: 'Contenu en markdown.' },
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
          id: '1',
          content: 'Bonjour',

        },
        item2: {
          id: '2',
          content: 'Hello',

        },
      },
      {
        item1: {
          id: '3',
          content: 'Bienvenue',

        },
        item2: {
          id: '4',
          content: 'Welcome',

        },
      },

      {
        item1: {
          id: '5',
          content: 'Merci',

        },
        item2: {
          id: '6',
          content: 'Thank you',

        },
      },

      {
        item1: {
          id: '7',
          content: 'Pas de problème',

        },

        item2: {
          id: '8',
          content: 'No problem',

        },
      },
      {
        item1: {
          id: '9',
          content: 'Au revoir',
          audio: null,

        },
        item2: {
          id: '10',
          content: 'Goodbye',
          audio: null,

        },
      },
      {
        item1: {
          id: '11',
          content: 'De rien',
          audio: null,


        },
        item2: {
          id: '12',
          content: 'You are welcome',
          audio: null,
        },
      }
    ],
    numberPairToShow: 3,
  },

})