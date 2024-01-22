import type { CodegenConfig } from '@graphql-codegen/cli'

const scalars = {
  UUID: 'string',
  DateTime: 'string',
  Date: 'string',
}

const config: CodegenConfig = {
  schema: './schema.gql',
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
      presetConfig: { baseTypesPath: '~@platon/graphql' },
      documents: ['./libs/**/*.graphql.ts'],
      plugins: ['typescript', 'typescript-operations', 'typescript-apollo-angular'],
    },
  },
}
export default config
