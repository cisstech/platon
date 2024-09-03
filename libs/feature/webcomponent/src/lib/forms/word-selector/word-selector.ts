import { defineWebComponent, IWebComponent, WebComponentTypes } from '../../web-component'

export interface WordSelectorState extends IWebComponent {}

export const WordSelectorComponentDefinition = defineWebComponent({
  type: WebComponentTypes.form,
  name: 'WordSelector',
  icon: 'assets/images/components/forms/word-selector/word-selector.svg',
  selector: 'wc-word-selector',
  description: 'Permets de saisir du texte dans un champ de saisi.',
  fullDescriptionUrl: 'assets/docs/components/forms/word-selector/word-selector.md',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    title: 'WordSelector',
    properties: {},
  },
  showcase: {},
})
