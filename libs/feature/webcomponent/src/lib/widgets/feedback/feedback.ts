import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes
} from '../../web-component';

export interface FeedbackState extends IWebComponent {
  type: 'success' | 'info' | 'warning' | 'error';
  content: string;
}


export const FeedbackComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'Feedback',
  icon: 'assets/images/components/widgets/feedback/feedback.svg',
  selector: 'wc-feedback',
  description: "Permets d'afficher un feedback.",
  fullDescriptionUrl:
    'assets/docs/components/widgets/feedback/feedback.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: ['content'],
    properties: {
      type: {
        type: 'string',
        default: 'info',
        description: "Type de feedback",
        enum: ['success', 'info', 'warning', 'error'],
      },
      content: { type: 'string', description: 'Contenu en markdown.' },
    },
  },
  showcase: {
    type: 'success',
    content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.'
  },
});
