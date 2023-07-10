import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface RadioGroupItem {
  css?: string
  content: string
}

export interface RadioGroupState extends IWebComponent {
  items: RadioGroupItem[]
  disabled: boolean
  selection: string
  horizontal: boolean
}

export const RadioGroupComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'RadioGroup',
  icon: 'assets/images/components/forms/radio-group/radio-group.svg',
  selector: 'wc-radio-group',
  description: 'Permets de choisir une proposition parmi une liste.',
  fullDescriptionUrl: 'assets/docs/components/forms/radio-group/radio-group.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'RadioGroup',
    required: ['items'],
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
            css: {
              type: 'string',
              description: 'Voir api css.',
            },
            content: {
              type: 'string',
              description: 'Contenu en markdown.',
            },
          },
        },
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver la possibilité de sélectionner les propositions?',
      },
      selection: {
        type: 'string',
        default: '',
        description: 'Identifiant de la proposition sélectionnée',
      },
      horizontal: {
        type: 'boolean',
        default: false,
        description: 'Afficher horizontalement les propositions?',
      },
    },
  },
  showcase: {
    items: ['Choix 1', 'Choix 2', 'Choix 3'],
  },
})
