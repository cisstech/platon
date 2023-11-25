import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { NotFoundResponse } from '@platon/core/common'
import { UserPrefsGraphModel, UserPrefsService, UserService } from '../users'
import { UserFiltersInput, UserGraphModel } from './user.graphql'

@Resolver(() => UserGraphModel)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly userPrefsService: UserPrefsService
  ) {}

  @Query(() => [UserGraphModel])
  async users(
    @Args('filters', { type: () => UserFiltersInput, nullable: true })
    filters?: UserFiltersInput
  ): Promise<UserGraphModel[]> {
    const [items] = await this.userService.search(filters)
    return items.map((item) => new UserGraphModel(item))
  }

  @Query(() => UserGraphModel)
  async user(@Args('input') input: string): Promise<UserGraphModel> {
    const user = (await this.userService.findByIdOrName(input)).orElseThrow(
      () => new NotFoundResponse(`User not found: ${input}`)
    )
    return new UserGraphModel(user)
  }

  @ResolveField(() => UserPrefsGraphModel)
  async prefs(@Parent() user: UserGraphModel): Promise<UserPrefsGraphModel> {
    const prefs = await this.userPrefsService.findByUserId(user.id)
    return new UserPrefsGraphModel(prefs)
  }
}
