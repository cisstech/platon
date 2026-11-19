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
