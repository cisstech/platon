import { stripIndent } from 'common-tags'
import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface PresenterState extends IWebComponent {
  template: string
}

export const PresenterComponentDefinition = defineWebComponent({
  type: WebComponentTypes.widget,
  name: 'Presenter',
  selector: 'wc-presenter',
  description: 'Permets de créer des presentations.',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    required: [],
    properties: {
      template: { type: 'string', default: '', description: 'Presenter content' },
    },
  },
  showcase: {
    template: stripIndent`
      <section data-markdown>
        <textarea data-template>
          ## Presenter Component
          Component based on Reveal.js

          [Documentation](https://revealjs.com/)
          ---
          ## Markdown plugin
          Presente simply with markdown
          [Documentation](https://revealjs.com/markdown/)
          ---
          ## Highlight plugin
          Present your code simply.
          \`\`\`js [1-2|3|4]
          let a = 1;
          let b = 2;
          let c = x => 1 + 2 + x;
          c(3);
          \`\`\`
          [Documentation](https://revealjs.com/code/)
          ---
          ## Math plugin
          \`$$ J(\\theta_0,\\theta_1) = \\sum_{i=0} $$\`
          [Documentation](https://revealjs.com/math/)
        </textarea>
      </section>
    `,
  },
})
