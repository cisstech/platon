import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface CheckboxItem {
  css?: string
  content: string
  checked?: boolean
}
export interface CheckboxGroupState extends IWebComponent {
  items: CheckboxItem[]
  disabled: boolean
  horizontal: boolean
}

export const CheckboxGroupComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'CheckboxGroup',
  selector: 'wc-checkbox-group',
  description: 'Permets de choisir plusieurs propositions parmi une liste.',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'CheckboxGroup',
    properties: {
      items: {
        type: 'array',
        default: [],
        description: 'La liste des propositions.',
        items: {
          type: ['string', 'object'],
          required: ['content'],
          additionalProperties: false,
          properties: {
            css: { type: 'string', description: 'Voir API CSS' },
            checked: {
              type: 'boolean',
              description: 'La proposition est sélectionnée?',
              default: false,
            },
            content: { type: 'string', description: 'Contenu en markdown.' },
          },
        },
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver la possibilité de sélectionner les propositions?',
      },
      horizontal: {
        type: 'boolean',
        default: false,
        description: 'Afficher horizontalement les propositions?',
      },
    },
    required: ['items'],
  },
  showcase: {
    items: ['Choix 1', 'Choix 2', 'Choix 3'],
  },
})
