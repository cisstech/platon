import { Controller, Delete, Get, MessageEvent, Patch, Query, Req, Sse } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, MAX_PAGE_SIZE } from '@platon/core/common'
import { IRequest, Mapper, UUIDParam, eventStream } from '@platon/core/server'
import { Notification } from '@platon/feature/notification/common'
import { Observable, concatMap } from 'rxjs'
import { NotificationDTO, NotificationFiltersDTO } from './notification.dto'
import { NotificationService } from './notification.service'

/** The notifications of the person signed in: every route reads and writes theirs only. */
@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /** Newest first, 50 at most; signals stay in unless `excludeSignals` asks otherwise. */
  @Get()
  async list(@Req() req: IRequest, @Query() filters: NotificationFiltersDTO): Promise<ListResponse<NotificationDTO>> {
    const [notifications, total] = await this.service.ofUser(req.user.id, {
      ...filters,
      limit: filters.limit ?? MAX_PAGE_SIZE,
    })
    return new ListResponse({ resources: await Promise.all(notifications.map((item) => this.toDTO(item))), total })
  }

  /** The unread notifications, signals left out. */
  @Get('unread-count')
  async unreadCount(@Req() req: IRequest): Promise<ItemResponse<number>> {
    return new ItemResponse({ resource: await this.service.unreadCount(req.user.id) })
  }

  /** The unread count when the stream opens, then after each change, with the notification that has just arrived. */
  @Sse('stream')
  stream(@Req() req: IRequest): Observable<MessageEvent> {
    return eventStream(
      req,
      this.service
        .changesOf(req.user.id)
        .pipe(
          concatMap(async ({ unreadCount, notification }) =>
            notification ? { unreadCount, notification: await this.toDTO(notification) } : { unreadCount }
          )
        )
    )
  }

  @Patch('read')
  async markAllAsRead(@Req() req: IRequest): Promise<void> {
    await this.service.markAllAsRead(req.user.id)
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<void> {
    await this.service.markAsRead(req.user.id, [id])
  }

  @Delete()
  async deleteAll(@Req() req: IRequest): Promise<void> {
    await this.service.deleteAll(req.user.id)
  }

  @Delete(':id')
  async delete(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<void> {
    await this.service.delete(req.user.id, [id])
  }

  private async toDTO(notification: Notification<Record<string, unknown>>): Promise<NotificationDTO> {
    const extra = await this.service.withExtraData(notification)
    return Mapper.map({ ...notification, data: { ...notification.data, ...extra } }, NotificationDTO)
  }
}
