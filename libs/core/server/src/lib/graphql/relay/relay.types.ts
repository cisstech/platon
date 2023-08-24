import { Type } from '@nestjs/common'
import { Field, ObjectType } from '@nestjs/graphql'
import * as Relay from 'graphql-relay'

const typeMap: Record<string, any> = {}
export function RelayConnection<T>(type: Type<T>) {
  const { name } = type
  if (typeMap[`${name}`]) return typeMap[`${name}`]

  @ObjectType(`${name}Edge`, { isAbstract: true })
  class Edge implements Relay.Edge<T> {
    public name = `${name}Edge`

    @Field()
    public cursor!: Relay.ConnectionCursor

    @Field(() => type)
    public node!: T
  }

  @ObjectType(`${name}PageInfo`, { isAbstract: true })
  class PageInfo implements Relay.PageInfo {
    @Field({ nullable: true })
    public startCursor!: Relay.ConnectionCursor

    @Field({ nullable: true })
    public endCursor!: Relay.ConnectionCursor

    @Field(() => Boolean)
    public hasPreviousPage!: boolean

    @Field(() => Boolean)
    public hasNextPage!: boolean
  }

  @ObjectType(`${name}Connection`, { isAbstract: true })
  abstract class Connection implements Relay.Connection<T> {
    public name = `${name}Connection`

    @Field(() => [Edge])
    public edges!: Relay.Edge<T>[]

    @Field(() => PageInfo)
    public pageInfo!: Relay.PageInfo

    @Field(() => Number)
    public totalCount!: number
  }

  typeMap[`${name}`] = Connection
  return typeMap[`${name}`]
}
