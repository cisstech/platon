import { Field, ObjectType } from '@nestjs/graphql'
import { UUID } from './scalars/uuid.scalar'

@ObjectType()
export class BaseGraphModel {
  @Field(() => UUID)
  readonly id!: string

  @Field()
  readonly createdAt!: Date

  @Field()
  readonly updatedAt!: Date
}
