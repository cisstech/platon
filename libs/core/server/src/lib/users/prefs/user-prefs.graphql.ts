import { Field, ObjectType } from "@nestjs/graphql";
import { UserPrefsEntity } from "./user-prefs.entity";


@ObjectType('UserPrefs')
export class UserPrefsGraphModel {
  constructor(data: Partial<UserPrefsEntity>) {
    Object.assign(this, {
      levels: data.levels?.map((level) => level.name) || [],
      topics: data.topics?.map((topic) => topic.name) || [],
    } as UserPrefsGraphModel);
  }

  @Field(() => [String])
  readonly levels!: string[]

  @Field(() => [String])
  readonly topics!: string[]
}

