import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validate(uuid: unknown): uuid is string {
  if (typeof uuid !== 'string' || !regex.test(uuid)) {
    throw new Error('invalid UUID')
  }
  return true
}

export const UUID = new GraphQLScalarType({
  name: 'UUID',
  description:
    'The `UUID` scalar type represents UUID values as specified by [RFC 4122](https://tools.ietf.org/html/rfc4122).',
  serialize: (value: unknown) => {
    if (!validate(value)) {
      throw new TypeError(`UUID cannot represent non-UUID value: ${value}`)
    }

    return value.toLowerCase()
  },
  parseValue: (value: unknown) => {
    if (!validate(value)) {
      throw new TypeError(`UUID cannot represent non-UUID value: ${value}`)
    }

    return value.toLowerCase()
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      if (validate(ast.value)) {
        return ast.value
      }
    }

    return undefined
  },
})
