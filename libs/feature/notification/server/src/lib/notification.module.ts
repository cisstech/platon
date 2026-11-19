import { Global, Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationController } from './notification.controller'
import { NotificationEntity } from './notification.entity'
import { NotificationService } from './notification.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [TypeOrmModule, NotificationService],
})
export class FeatureNotificationServerModule implements OnModuleInit {
  constructor(private readonly notificationService: NotificationService) {}

  async onModuleInit() {
    await this.notificationService.init()
  }
}
