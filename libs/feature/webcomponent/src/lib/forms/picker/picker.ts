import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface PickerState extends IWebComponent {
  hint: string
  items: string[]
  prefix: string
  suffix: string
  selection: string
  placeholder: string
  disabled: boolean
}

export const PickerComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'Picker',
  selector: 'wc-picker',
  description:
    "Menu déroulant permettant de sélectionner une valeur parmi une liste prédéfinie. Idéal pour les exercices à choix limité, les sélections de paramètres, de catégories, ou de valeurs spécifiques dans un ensemble fermé, offrant une interface compacte pour les questions où l'espace est limité.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['items'],
    properties: {
      items: {
        type: 'array',
        default: [],
        description: 'La liste des choix.',
        items: { type: 'string' },
      },
      prefix: {
        type: 'string',
        default: '',
        description: 'Une icône à afficher à gauche du picker.',
      },
      suffix: {
        type: 'string',
        default: '',
        description: 'Une icône à afficher à droite du picker.',
      },
      hint: {
        type: 'string',
        default: '',
        description: 'Une indication à afficher en bas du picker.',
      },
      selection: {
        type: 'string',
        default: '',
        description: "L'élément sélectionné dans la liste items.",
      },
      placeholder: {
        type: 'string',
        default: '',
        description: 'Le texte indicatif du picker.',
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver la sélection?',
      },
    },
  },
  showcase: {
    items: ['Choix 1', 'Choix 2', 'Choix 3'],
  },
})
