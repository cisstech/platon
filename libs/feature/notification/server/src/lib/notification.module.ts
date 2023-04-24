import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './notification.entity';
import { NotificationChangeResolver, NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity
    ])
  ],
  providers: [
    NotificationService,
    NotificationResolver,
    NotificationChangeResolver,
  ],
  exports: [TypeOrmModule, NotificationService],
})
export class FeatureNotificationServerModule {}
