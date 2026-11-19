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
        project: ['apps/web/tsconfig.*?.json'],
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
      rules: {
        ...config.rules,
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/component-class-suffix': [
          'error',
          {
            suffixes: ['Page', 'Component'],
          },
        ],
        // Newly enabled by the Angular ESLint preset; was not enforced before the migration.
        '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      },
    })),
  {
    // New code follows the Angular style guide: no type suffix on class names (`Home`, not `HomePage`).
    files: ['**/src/next/**/*.ts', '**/src/app/ui-switch/**/*.ts'],
    rules: {
      '@angular-eslint/component-class-suffix': 'off',
    },
  },
  {
    // The new interface is built beside the current one: none of its components, styles or vendors.
    // A spec may import a vendor token to prove it is not provided.
    files: ['**/src/next/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@platon/core/browser',
              message:
                'The main entry pulls in the current interface (ng-zorro, Material, Monaco): import from @platon/core/browser/shared.',
            },
          ],
          patterns: [
            {
              group: ['ng-zorro-antd', 'ng-zorro-antd/*'],
              message: 'ng-zorro stays in the current interface: use @platon/design-system.',
            },
            {
              group: ['@angular/material', '@angular/material/*'],
              message:
                'Material stays in the current interface: use @platon/design-system, the Angular CDK or Angular Aria.',
            },
            {
              regex: '^@platon/feature/[^/]+/browser$',
              message:
                'The main entry of a feature library pulls in its components and vendors: import from its /shared entry (D21).',
            },
            {
              group: ['@platon/shared/ui', '@platon/shared/ui/*'],
              message: 'The ui-* components belong to the current interface: use @platon/design-system.',
            },
            {
              regex: '^(\\.\\./)+app(/|$)',
              message: 'apps/web/src/app is the current interface: share through a library or apps/web/src/shared.',
            },
          ],
        },
      ],
    },
  },
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.html'],
    rules: {
      // Newly enabled by the Angular ESLint preset; was not enforced before the migration.
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
]
