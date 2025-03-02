import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface SortListItem {
  css?: string
  content: string
}

export interface SortListState extends IWebComponent {
  items: SortListItem[]
  alignment?: 'center' | 'left'
  disabled: boolean
}

export const SortListComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'SortList',
  selector: 'wc-sort-list',
  description:
    "Liste interactive d'éléments réorganisables par glisser-déposer. Parfait pour les exercices de séquençage, de tri logique, d'ordonnancement d'instructions ou d'événements, de classement chronologique, d'algorithmes de tri, ou toute activité pédagogique où l'ordre des éléments est significatif.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'SortList',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        default: [],
        description: 'La liste des éléments à ordonner.',
        items: {
          type: ['string', 'object'],
          required: ['content'],
          additionalProperties: false,
          properties: {
            css: {
              type: 'string',
              description: 'Voir API CSS',
            },
            content: {
              type: 'string',
              description: 'Contenu en markdown.',
            },
          },
        },
      },
      alignment: {
        type: 'string',
        default: 'center',
        description: 'Alignement des items du SortList',
        enum: ['center', 'left'],
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver le composant?',
      },
    },
  },
  showcase: {
    items: ['Choix 1', 'Choix 2', 'Choix 3'],
  },
})
