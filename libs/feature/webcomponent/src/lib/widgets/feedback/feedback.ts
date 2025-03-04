import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface FeedbackState extends IWebComponent {
  type: 'success' | 'info' | 'warning' | 'error'
  content: string
}

export const FeedbackComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'Feedback',
  selector: 'wc-feedback',
  description:
    "Composant d'affichage de messages de retour avec différents niveaux visuels (succès, information, avertissement, erreur). Essentiel pour fournir des retours clairs aux apprenants sur leurs réponses, donner des indications supplémentaires, ou afficher des messages contextuels dans tout type d'exercice interactif.",
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['content'],
    properties: {
      type: {
        type: 'string',
        default: 'info',
        description: 'Type de feedback',
        enum: ['success', 'info', 'warning', 'error'],
      },
      content: { type: 'string', description: 'Contenu en markdown.' },
    },
  },
  showcase: {
    type: 'success',
    content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
  },
})
