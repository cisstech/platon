import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface FoldableFeedbackContent {
  name: string
  description: string
  expected: string
  obtained: string
  arguments: string
  type: 'success' | 'info' | 'warning' | 'error'
  display: boolean
  feedbacks: FoldableFeedbackContent[] | undefined
}

export interface FoldableFeedbackState extends IWebComponent {
  content: FoldableFeedbackContent[]
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
          required: ['name'],
          properties: {
            name: { type: 'string', description: 'Nom du test effectué', default: '' },
            description: { type: 'string', description: 'Description du test effectué', default: '' },
            expected: { type: 'string', description: 'Valeur attendue par le professeur', default: '' },
            obtained: { type: 'string', description: "Valeur obtenue par l'étudiant", default: '' },
            arguments: { type: 'string', description: "Arguments passés à l'execution", default: '' },
            type: {
              type: 'string',
              description: 'Type de feedback',
              enum: ['success', 'info', 'warning', 'error'],
              default: 'info',
            },
            display: { type: 'boolean', description: 'Affichage (le feedback est-il déplié ?)', default: false },
            feedbacks: {
              type: 'array',
              description:
                'Feedbacks enfants. Même structure que content. Si défini, ce feedback est une catégorie donc ne pas définir expected, obtained et arguments',
              items: {
                type: 'object',
              },
            },
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
      {
        name: 'Catégorie de feedbacks',
        description: 'Ceci est une catégorie de feedbacks.\nElle contient des feedbacks enfants.',
        type: 'warning',
        display: false,
        feedbacks: [
          { name: 'Feedback 1', expected: 'Bonne réponse', obtained: 'Bonne réponse', type: 'success', display: false },
          {
            name: 'Sous-Catégorie',
            type: 'error',
            display: false,
            feedbacks: [
              {
                name: 'Feedback 2',
                expected: 'Faux',
                obtained: 'rien...',
                type: 'error',
                display: false,
              },
            ],
          },
        ],
      },
    ],
  },
})
