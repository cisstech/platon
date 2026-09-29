import type { StorybookConfig } from '@storybook/angular'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/angular', options: {} },
  // Same address as in the application, so `pl-icon` finds its sprite in both.
  staticDirs: [{ from: '../src/assets', to: '/assets/design-system' }],
  core: { disableTelemetry: true },
}

export default config
