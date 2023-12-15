import type { CodegenConfig } from '@graphql-codegen/cli'

const scalars = {
  UUID: 'string',
  DateTime: 'string',
  Date: 'string',
}

const config: CodegenConfig = {
  schema: './schema.gql',
  documents: ['./libs/**/!(*.generated).ts', './apps/**/!(*.generated).ts'],
  ignoreNoDocuments: true,
  generates: {
    './.graphql/types.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
        avoidOptionals: true,
        scalars,
      },
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: { extension: '.generated.ts', baseTypesPath: '~@platon/graphql' },
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
      config: {
        addExplicitOverride: true,
        avoidOptionals: true,
        scalars,
      },
    },
  },
}
export default config
