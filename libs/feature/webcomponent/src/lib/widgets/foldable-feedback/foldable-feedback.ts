import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface FoldableFeedbackState extends IWebComponent {
  content: {
    name: string
    description: string
    expected: string
    obtained: string
    arguments: string
    type: 'success' | 'info' | 'warning' | 'error'
    display: boolean
  }[]
}

export const FoldableFeedbackComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'FoldableFeedback',
  icon: 'assets/images/components/widgets/foldable-feedback/foldable-feedback.svg',
  selector: 'wc-foldable-feedback',
  description: "Permets d'afficher un feedback pliable.",
  fullDescriptionUrl: 'assets/docs/components/widgets/foldable-feedback/foldable-feedback.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['content'],
    properties: {
      content: {
        type: 'array',
        description: 'Contenu du feedback',
        items: {
          type: 'object',
          required: ['name', 'expected', 'obtained'],
          properties: {
            name: { type: 'string', description: 'Nom du test effectué', default: '' },
            description: { type: 'string', description: 'Description du test effectué', default: '' },
            expected: { type: 'string', description: 'Valeur attendue par le professeur', default: '' },
            obtained: { type: 'string', description: "Valeur obtenue par l'étudiant", default: '' },
            arguments: { type: 'string', description: "Arguments passés à l'execution (optionel)", default: '' },
            type: {
              type: 'string',
              description: 'Type de feedback',
              enum: ['success', 'info', 'warning', 'error'],
              default: 'info',
            },
            display: { type: 'boolean', description: 'Affichage (le feedback est-il déplié ?)', default: false },
          },
        },
      },
    },
  },
  showcase: {
    content: [
      { name: 'Test Success', expected: 'Bonne réponse', obtained: 'Bonne réponse', type: 'success', display: false },
      {
        name: 'Test Warning + Arguments',
        expected: 'Pas très bon',
        obtained: 'Pas tres bonne',
        arguments: '--this-is-an-arg --option this-is-an-option',
        type: 'warning',
        display: false,
      },
      {
        name: 'Test Error + Plusieurs Lignes',
        expected: 'Quelque chose\nBeaucoup de choses\nSur plusieurs lignes',
        obtained: 'Rien',
        type: 'error',
        display: false,
      },
      {
        name: 'Test Info + Description',
        description: "Ceci est la description de ce test.\nElle explique ce qu'il fait.",
        expected: 'Presque !',
        obtained: 'Presque',
        type: 'info',
        display: false,
      },
    ],
  },
})
