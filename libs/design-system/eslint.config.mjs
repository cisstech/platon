import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import baseConfig from '../../eslint.config.mjs'
import nx from '@nx/eslint-plugin'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...compat
    .config({
      parserOptions: {
        project: ['libs/design-system/tsconfig.*?.json', 'libs/design-system/.storybook/tsconfig.json'],
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
      rules: {
        ...config.rules,
        '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'pl', style: 'camelCase' }],
        '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'pl', style: 'kebab-case' }],
        // Angular style guide: `Icon`, not `IconComponent`.
        '@angular-eslint/component-class-suffix': 'off',
        '@angular-eslint/directive-class-suffix': 'off',
        '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      },
    })),
  {
    // The design system stands alone: no vendor of the current interface, no PLaTon code.
    files: ['**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['ng-zorro-antd', 'ng-zorro-antd/*'],
              message: 'Build on the Angular CDK or Angular Aria instead of ng-zorro.',
            },
            {
              group: ['@angular/material', '@angular/material/*'],
              message: 'Build on the Angular CDK or Angular Aria instead of Material.',
            },
            {
              group: ['@platon/*', '!@platon/design-system'],
              message: 'The design system imports no PLaTon code: the application passes what it needs through inputs.',
            },
          ],
        },
      ],
    },
  },
  ...nx.configs['flat/angular-template'],
]
