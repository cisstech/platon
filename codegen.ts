import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://localhost/api/graphql',
  documents: ['./libs/**/!(*.generated).ts', './apps/**/!(*.generated).ts'],
  generates: {
    './.graphql/types.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular'
      ],
      config: {
        addExplicitOverride: true,
      }
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: { extension: '.generated.ts', baseTypesPath: '~@platon/graphql' },
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-apollo-angular'
      ],
      config: {
        addExplicitOverride: true,
      }
    },
  }
}
export default config
