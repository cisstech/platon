import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface MatrixCell {
  css?: string
  value: string
  disabled?: string
}

export interface MatrixState extends IWebComponent {
  cols: number
  rows: number
  disabled: boolean
  resizable: boolean
  cells: MatrixCell[]
}

export const MatrixComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'Matrix',
  selector: 'wc-matrix',
  description:
    "Composant permettant de saisir ou afficher une matrice de valeurs. Idéal pour les exercices de calcul matriciel, résolution de systèmes d'équations linéaires, transformations géométriques ou tout problème nécessitant l'entrée ou l'affichage de données tabulaires.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['rows', 'cols', 'cells'],
    properties: {
      rows: {
        type: 'number',
        default: 0,
        description: 'Le nombre de lignes de la matrice.',
      },
      cols: {
        type: 'number',
        default: 0,
        description: 'Le nombre de colonnes de la matrice.',
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver les cellules de la matrice?',
      },
      resizable: {
        type: 'boolean',
        default: false,
        description: 'La taille de la matrice est elle modifiable?',
      },
      cells: {
        type: 'array',
        items: {
          type: ['object', 'string'],
          default: [],
          required: ['value'],
          additionalProperties: false,
          properties: {
            css: {
              type: 'string',
              default: '',
              description: 'Voir la page API CSS.',
            },
            value: {
              type: 'string',
              default: '',
              description: 'La valeur de la cellule.',
            },
            disabled: {
              type: 'boolean',
              default: false,
              description: 'Désactiver la cellule?',
            },
          },
        },
      },
    },
  },
  showcase: {
    rows: 3,
    cols: 3,
    resizable: true,
  },
})
