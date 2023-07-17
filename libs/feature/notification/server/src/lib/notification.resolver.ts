import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { GqlReq, IRequest, PubSubService, UUID, UserGraphModel } from '@platon/core/server'
import { NotificationFilters } from '@platon/feature/notification/common'
import GraphQLJSON from 'graphql-type-json'
import { NotificationEntity } from './notification.entity'
import { NotificationChangeGraphModel, NotificationFiltersInput, NotificationGraphModel } from './notification.graphql'
import { ON_CHANGE_NOTIFICATIONS, OnChangeNotificationsPayload } from './notification.pubsub'
import { NotificationService } from './notification.service'

@Resolver(() => NotificationGraphModel)
export class NotificationResolver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly notificationService: NotificationService
  ) {}

  @Query(() => Int)
  async unreadNotificationsCount(@GqlReq() req: IRequest): Promise<number> {
    return this.notificationService.unreadCount(req.user.id)
  }

  @Query(() => [NotificationGraphModel])
  async notifications(
    @GqlReq() req: IRequest,
    @Args('filters', { type: () => NotificationFiltersInput, nullable: true })
    filters?: NotificationFilters
  ): Promise<NotificationGraphModel[]> {
    const [items] = await this.notificationService.ofUser(req.user.id, filters)
    return items.map((item) => new NotificationGraphModel(item))
  }

  @Mutation(() => NotificationGraphModel)
  async markAsRead(@GqlReq() req: IRequest, @Args('id', { type: () => UUID }) id: string): Promise<boolean> {
    await this.notificationService.markAsRead(req.user.id, [id])
    return true
  }

  @Mutation(() => NotificationGraphModel)
  async markAsUnread(@GqlReq() req: IRequest, @Args('id', { type: () => UUID }) id: string): Promise<boolean> {
    await this.notificationService.markAsUnread(req.user.id, [id])
    return true
  }

  @Mutation(() => Boolean)
  async markAllAsRead(@GqlReq() req: IRequest): Promise<boolean> {
    return this.notificationService.markAllAsRead(req.user.id)
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
      ...((await this.notificationService.withExtaData(parent as NotificationEntity)) || {}),
    }
  }

  @Subscription(() => NotificationChangeGraphModel, {
    filter: (payload: OnChangeNotificationsPayload, variables, context) => {
      const req = context.req as IRequest
      return payload.onChangeNotifications.userId === req.user.id
    },
    resolve: (payload: OnChangeNotificationsPayload) => {
      return new NotificationChangeGraphModel({
        newNotification: payload.onChangeNotifications.newNotification
          ? new NotificationGraphModel(payload.onChangeNotifications.newNotification)
          : undefined,
        notifications: payload.onChangeNotifications.notifications?.map(
          (notification) => new NotificationGraphModel(notification)
        ),
      })
    },
  })
  onChangeNotifications() {
    return this.pubSubService.asyncIterator(ON_CHANGE_NOTIFICATIONS)
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
