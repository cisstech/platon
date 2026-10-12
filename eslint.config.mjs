import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import nx from '@nx/eslint-plugin'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import typescriptEslintParser from '@typescript-eslint/parser'
import jsoncEslintParser from 'jsonc-eslint-parser'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

export default [
  js.configs.recommended,
  ...compat.extends('plugin:prettier/recommended', 'prettier'),
  ...nx.configs['flat/base'],
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
  },
  { languageOptions: { parser: typescriptEslintParser } },
  {
    rules: {},
  },
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-extra-semi': 'error',
    },
  },
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
      },
    })),
  {
    ignores: [
      '# .eslintignore',
      '*',
      '!*/',
      '!**/*.js',
      '!**/*.ts',
      '!**/*.json',
      'dist',
      'umd',
      '.cache',
      'tmp',
      'CODEOWNERS',
      '**/pl.parser.ts',
      'shared/external_libs',
      'migrations',
      'dumps',
      'apps/docs/.next',
    ],
  },
]
