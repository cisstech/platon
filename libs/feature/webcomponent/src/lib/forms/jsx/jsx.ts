import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface JsxPoint {
  x: number
  y: number
}

export interface JsxState extends IWebComponent {
  script: string
  points: Record<string, JsxPoint>
  disabled: boolean
  attributes: Record<string, unknown>
}

export const JsxComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'Jsx',
  selector: 'wc-jsx',
  description:
    'Interface graphique interactive basée sur JSXGraph permettant de créer, manipuler et explorer des constructions géométriques dynamiques. Idéal pour les exercices de géométrie euclidienne, trigonométrie, fonctions mathématiques, lieux géométriques, ou pour illustrer des concepts physiques avec des simulations visuelles.',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
      script: {
        type: 'string',
        default: '',
        description: "Le script d'initialisation de JSX.",
      },
      points: {
        type: 'object',
        default: {},
        description: "Les points présents sur l'instance de JSX.",
      },
      disabled: {
        type: 'boolean',
        default: false,
        description: "Désactiver l'interaction avec JSX?",
      },
      attributes: {
        type: 'object',
        default: {},
        description: 'La configuration de JSX.',
      },
    },
  },
  showcase: {
    // debug: true,
    script: stripIndent`
        const grid = board.create('grid', [], {gridX: 0.25, gridY: 0.25});
        const Ox = board.create('axis', [[0, 0], [1, 0]], {ticks: {visible: false}});
        const Oy = board.create('axis', [[0, 0], [0, 1]], {ticks: {visible: false}});
        const circle = board.create('circle', [[0, 0], [0, 1]], {strokeColor: 'blue', fixed: true});
        const O = board.create('point', [0, 0], {size: 1, name: 'O', color: 'black', fixed: true});
        const A = board.create('point', [1, 0], {size: 1, name: 'A', color: 'black', fixed: true});
        const M = board.create('glider', [1, 1, circle], {size: 2, name: 'M', color: 'red'});
        const secOAM = board.create('sector', [O, A, M], {color: 'orange'});
        `,
  },
})
