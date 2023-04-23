import { Field, ObjectType } from "@nestjs/graphql";
import { UUID } from "../graphql";

@ObjectType()
export class BaseModel {
  @Field(() => UUID)
  readonly id!: string;

  @Field(() => Date)
  readonly createdAt!: Date;

  @Field(() => Date)
  readonly updatedAt?: Date;
}
