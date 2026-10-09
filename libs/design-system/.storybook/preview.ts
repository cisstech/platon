import type { Decorator, Preview } from '@storybook/angular'

/** Puts the chosen theme on the document root, where the tokens read it. */
const withTheme: Decorator = (story, context) => {
  document.documentElement.dataset['theme'] = context.globals['theme']
  return story()
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    backgrounds: { disable: true },
    a11y: { test: 'error' },
  },
}

export default preview
