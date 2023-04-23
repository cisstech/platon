import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { NotFoundResponse } from "@platon/core/common";
import { UserPrefsModel, UserPrefsService, UserService } from "../users";
import { UserFiltersInput, UserModel } from "./user.model";

@Resolver(() => UserModel)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userPrefsService: UserPrefsService,
  ) { }

  @Query(() => [UserModel])
  async users(
    @Args('filters', { type: () => UserFiltersInput, nullable: true })
    filters?: UserFiltersInput,
  ): Promise<UserModel[]> {
    const [items] = await this.userService.search(filters);
    return items.map(item => new UserModel(item));
  }

  @Query(() => UserModel)
  async user(
    @Args('input') input: string,
  ): Promise<UserModel> {
    const user = (await this.userService.findByIdOrName(input)).
      orElseThrow(() => new NotFoundResponse(`User not found: ${input}`));
    return new UserModel(user)
  }

  @ResolveField(() => UserPrefsModel)
  async prefs(@Parent() user: UserModel): Promise<UserPrefsModel> {
    const prefs = await this.userPrefsService.findByUserId(user.id);
    return new UserPrefsModel(prefs);
  }
}
