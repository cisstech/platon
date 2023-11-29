import { CustomScalar, Scalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string | null, Date | null> {
  description = 'Date custom scalar type'

  parseValue(value: unknown): Date {
    // value from the client
    return new Date(value as number)
  }

  serialize(value: unknown): string | null {
    // value to the client
    if (value) {
      return new Date(value as Date).toISOString()
    }
    return null
  }

  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value)
    }
    return null
  }
}
