import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface MathLiveState extends IWebComponent {
  value: string
  prefix: string
  suffix: string
  config: Record<string, unknown>
  disabled: boolean
}

export const MathLiveComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'MathLive',
  icon: 'assets/images/components/forms/math-live/math-live.svg',
  selector: 'wc-math-live',
  description: 'Permets de saisir des expressions mathématiques en latex.',
  fullDescriptionUrl: 'assets/docs/components/forms/math-live/math-live.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
      disabled: {
        type: 'boolean',
        default: false,
        description: 'Désactiver le champ de saisi?',
      },
      value: {
        type: 'string',
        default: '',
        description: 'La valeur du champ de saisi en Latex.',
      },
      config: {
        type: 'object',
        default: {},
        description: "La configuration de l'instance de la lib MathLive.",
      },
      prefix: {
        type: 'string',
        default: '',
        description: 'Une icône à afficher à gauche du champ de saisi.',
      },
      suffix: {
        type: 'string',
        default: '',
        description: 'Une icône à afficher à droite du champ de saisi.',
      },
    },
  },
  showcase: {
    value: '\\frac{\\sin(x)}{\\cos(x)}',
    suffix: 'clarity happy-face color=FF0000',
  },
})
