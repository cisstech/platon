import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import {
  GqlReq,
  IRequest,
  PubSubService,
  UUID,
  UserGraphModel,
  offsetLimitFromConnectionArgs,
} from '@platon/core/server'
import { connectionFromArraySlice } from 'graphql-relay'
import GraphQLJSON from 'graphql-type-json'
import { NotificationEntity } from './notification.entity'
import {
  NotificationChangeGraphModel,
  NotificationConnectionGraphModel,
  NotificationFiltersInput,
  NotificationGraphModel,
} from './notification.graphql'
import { ON_CHANGE_NOTIFICATIONS, OnChangeNotificationsPayload } from './notification.pubsub'
import { NotificationService } from './notification.service'

@Resolver(() => NotificationGraphModel)
export class NotificationResolver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly notificationService: NotificationService
  ) {}

  @Query(() => NotificationConnectionGraphModel)
  async notifications(
    @GqlReq() req: IRequest,
    @Args('filters', { nullable: true }) filters?: NotificationFiltersInput,
    @Args({ name: 'first', type: () => Int, nullable: true }) first?: number,
    @Args({ name: 'after', nullable: true }) after?: string
  ): Promise<NotificationConnectionGraphModel> {
    const args = { first, after }
    const { offset, limit } = offsetLimitFromConnectionArgs(args)

    const [items, count] = await this.notificationService.ofUser(req.user.id, {
      ...(filters ?? {}),
      offset,
      limit,
    })

    const connection = connectionFromArraySlice(
      items.map((item) => new NotificationGraphModel(item)),
      args,
      {
        arrayLength: count,
        sliceStart: offset || 0,
      }
    )

    return {
      ...connection,
      totalCount: count,
    }
  }

  @Mutation(() => Boolean)
  async markAsRead(@GqlReq() req: IRequest, @Args('id', { type: () => UUID }) id: string): Promise<boolean> {
    await this.notificationService.markAsRead(req.user.id, [id])
    return true
  }

  @Mutation(() => Boolean)
  async markAsUnread(@GqlReq() req: IRequest, @Args('id', { type: () => UUID }) id: string): Promise<boolean> {
    await this.notificationService.markAsUnread(req.user.id, [id])
    return true
  }

  @Mutation(() => Boolean)
  async markAllAsRead(@GqlReq() req: IRequest): Promise<boolean> {
    await this.notificationService.markAllAsRead(req.user.id)
    return true
  }

  @Mutation(() => Boolean)
  async deleteNotification(@GqlReq() req: IRequest, @Args('id', { type: () => UUID }) id: string): Promise<boolean> {
    const affected = await this.notificationService.delete(req.user.id, [id])
    return affected > 0
  }

  @Mutation(() => Boolean)
  async deleteAllNotifications(@GqlReq() req: IRequest): Promise<boolean> {
    const affected = await this.notificationService.deleteAll(req.user.id)
    return affected > 0
  }

  @ResolveField(() => UserGraphModel)
  async user(@GqlReq() req: IRequest): Promise<UserGraphModel> {
    return new UserGraphModel(req.user)
  }

  @ResolveField(() => GraphQLJSON)
  async data(@Parent() parent: NotificationGraphModel): Promise<Record<string, unknown>> {
    return {
      ...parent.data,
      ...((await this.notificationService.withExtraData(parent as NotificationEntity)) || {}),
    }
  }

  @Subscription(() => NotificationChangeGraphModel, {
    filter: (payload: OnChangeNotificationsPayload, _variables, context) => {
      const req = context.req as IRequest
      return payload.userId === req.user.id
    },
    resolve: (payload: OnChangeNotificationsPayload) => {
      return new NotificationChangeGraphModel({
        newNotification: payload.newNotification ? new NotificationGraphModel(payload.newNotification) : undefined,
      })
    },
  })
  onChangeNotifications(@GqlReq() req: IRequest) {
    return this.pubSubService.asyncIterator<OnChangeNotificationsPayload>(ON_CHANGE_NOTIFICATIONS, {
      userId: req.user.id,
    })
  }
}

@Resolver(() => NotificationChangeGraphModel)
export class NotificationChangeResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @ResolveField(() => Int)
  unreadCount(@GqlReq() req: IRequest): Promise<number> {
    return this.notificationService.unreadCount(req.user.id)
  }
}
