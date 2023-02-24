import { stripIndent } from 'common-tags';
import {
  defineWebComponent,
  IWebComponent,
  WebComponentTypes,
} from '../../web-component';

export interface MarkdownState extends IWebComponent {
  data: string;
  file: string;
}

export const MarkdownComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'Markdown',
  icon: 'assets/images/components/widgets/markdown/markdown.svg',
  selector: 'wc-markdown',
  description: "Permets d'afficher du markdown.",
  fullDescriptionUrl: 'assets/docs/components/widgets/markdown/markdown.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: [],
    properties: {
      data: { type: 'string', default: '', description: 'Texte en markdown' },
      file: {
        type: 'string',
        default: '',
        description: 'Url vers un fichier markdown à afficher',
      },
    },
  },
  showcase: {
    data: stripIndent`
        # H1
        ## H2

        :::+ note Admonition
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
        :::

        === Tab 1

        Content of Tab 1

        === Tab 2

        Content of Tab 2

        ===
        <https://mciissee.github.io/nge-markdown/cheatsheet>
        `,
  },
});
