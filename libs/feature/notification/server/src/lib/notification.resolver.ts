import { Args, Int, Mutation, Query, ResolveField, Resolver, Subscription } from '@nestjs/graphql'
import { GqlReq, IRequest, PubSubService, UserGraphModel, UUID } from '@platon/core/server'
import { NotificationFilters } from '@platon/feature/notification/common'
import {
  NotificationChangeGraphModel,
  NotificationFiltersInput,
  NotificationGraphModel,
} from './notification.graphql'
import { OnChangeNotificationsPayload, ON_CHANGE_NOTIFICATIONS } from './notification.pubsub'
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
  async markAsRead(@Args('id', { type: () => UUID }) id: string): Promise<NotificationGraphModel> {
    const notification = new NotificationGraphModel(
      (await this.notificationService.markAsRead([id]))[0]
    )
    await this.notificationService.notifyUserAboutChanges(notification.userId)
    return notification
  }

  @Mutation(() => NotificationGraphModel)
  async markAsUnread(
    @Args('id', { type: () => UUID }) id: string
  ): Promise<NotificationGraphModel> {
    const notification = new NotificationGraphModel(
      (await this.notificationService.markAsUnread([id]))[0]
    )
    await this.notificationService.notifyUserAboutChanges(notification.userId)
    return notification
  }

  @Mutation(() => Boolean)
  async markAllAsRead(@GqlReq() req: IRequest): Promise<boolean> {
    const success = await this.notificationService.markAllAsRead(req.user.id)
    if (success) await this.notificationService.notifyUserAboutChanges(req.user.id)
    return success
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @GqlReq() req: IRequest,
    @Args('id', { type: () => UUID }) id: string
  ): Promise<boolean> {
    const success = (await this.notificationService.delete([id])) > 0
    if (success) await this.notificationService.notifyUserAboutChanges(req.user.id)
    return success
  }

  @Mutation(() => Boolean)
  async deleteAllNotifications(@GqlReq() req: IRequest): Promise<boolean> {
    await this.notificationService.deleteAll(req.user.id)
    await this.notificationService.notifyUserAboutChanges(req.user.id)
    return true
  }

  @ResolveField(() => UserGraphModel)
  async user(@GqlReq() req: IRequest): Promise<UserGraphModel> {
    return new UserGraphModel(req.user)
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
