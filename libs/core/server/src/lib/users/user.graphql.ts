import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { OrderingDirections, User, UserOrderings, UserRoles } from "@platon/core/common";
import { UserEntity, UserFiltersDTO } from ".";
import { BaseGraphModel } from "../graphql";

registerEnumType(UserRoles, {
  name: 'UserRoles',
})

registerEnumType(OrderingDirections, {
  name: 'OrderingDirections',
})

registerEnumType(UserOrderings, {
  name: 'UserOrderings',
})

@ObjectType('User')
export class UserGraphModel extends BaseGraphModel implements User {
  constructor(data: Partial<UserEntity>) {
    super()
    Object.assign(this, data);
  }

  @Field(() => UserRoles)
  readonly role!: UserRoles;

  @Field()
  readonly username!: string;

  @Field(() => Boolean)
  readonly active!: boolean;

  @Field({ nullable: true })
  readonly firstName?: string;

  @Field({ nullable: true })
  readonly lastName?: string;

  @Field({ nullable: true })
  readonly email?: string;

  @Field(() => Date, { nullable: true })
  readonly lastLogin?: Date;

  @Field(() => Date, { nullable: true })
  readonly firstLogin?: Date;
}

@InputType('UserFiltersInput')
export class UserFiltersInput extends UserFiltersDTO {}

