import { Global, Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationEntity } from './notification.entity'
import { NotificationChangeResolver, NotificationResolver } from './notification.resolver'
import { NotificationService } from './notification.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [NotificationService, NotificationResolver, NotificationChangeResolver],
  exports: [TypeOrmModule, NotificationService],
})
export class FeatureNotificationServerModule implements OnModuleInit {
  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    await this.notificationService.init()
  }
}
