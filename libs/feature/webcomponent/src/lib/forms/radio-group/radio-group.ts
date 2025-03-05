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
  autoValidation: boolean
}

export const RadioGroupComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'RadioGroup',
  selector: 'wc-radio-group',
  description:
    "Ensemble de boutons radio pour sélection unique parmi une liste d'options. Essentiel pour les questionnaires à choix unique, les QCM, les sondages, les tests de connaissance, ou tout exercice nécessitant une sélection exclusive parmi plusieurs possibilités avec capacité d'afficher du contenu riche (images, formules) dans les options.",
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
      autoValidation: {
        type: 'boolean',
        default: false,
        description: 'Activer la validation automatique?',
      },
    },
  },
  showcase: {
    items: ['Choix 1', 'Choix 2', 'Choix 3'],
  },
  playgrounds: {
    'Système solaire': 'solar-system.ple',
  },
})
