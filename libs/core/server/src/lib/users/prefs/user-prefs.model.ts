import { Field, ObjectType } from "@nestjs/graphql";
import { UserPrefsEntity } from "./user-prefs.entity";


@ObjectType()
export class UserPrefsModel {
  constructor(data: Partial<UserPrefsEntity>) {
    Object.assign(this, {
      levels: data.levels?.map((level) => level.name) || [],
      topics: data.topics?.map((topic) => topic.name) || [],
    } as UserPrefsModel);
  }

  @Field(() => [String])
  readonly levels!: string[]

  @Field(() => [String])
  readonly topics!: string[]
}

