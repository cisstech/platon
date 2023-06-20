import { stripIndent } from 'common-tags';
import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes,
} from '../../web-component';

export interface PresenterState extends IWebComponent {
  data: string;
}

export const PresenterComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'Presenter',
  icon: 'assets/images/components/widgets/presenter/presenter.svg',
  selector: 'wc-presenter',
  description: "Permets de créer des presentations.",
  fullDescriptionUrl: 'assets/docs/components/widgets/presenter/presenter.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: [],
    properties: {
      data: { type: 'string', default: '', description: 'Presenter content' },
    },
  },
  showcase: {
    data: stripIndent`
        ## Slide 1
        A paragraph with some text and a [link](https://hakim.se).
        ---
        ## Slide 2
        ---
        ## Slide 3
        `,
  },
});
