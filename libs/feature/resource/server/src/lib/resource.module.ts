import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LevelModule, TopicModule, UserModule } from '@platon/core/server'
import {
  ResourceEventController,
  ResourceEventEntity,
  ResourceEventService,
  ResourceMemberCreateEventNotificationDataProvider,
} from './events'
import { ResourceEventSubscriber } from './events/event.subscriber'
import { ResourceFileController } from './files/file.controller'
import { ResourceFileService } from './files/file.service'
import { ResourceInvitationController, ResourceInvitationEntity, ResourceInvitationService } from './invitations'
import { ResourceInvitationNotificationDataProvider } from './invitations/invitation.providers'
import { ResourceInvitationSubscriber } from './invitations/invitation.subscriber'
import {
  ResourceMemberController,
  ResourceMemberEntity,
  ResourceMemberService,
  ResourceMemberSubscriber,
} from './members'
import { ResourcePermissionService } from './permissions/permissions.service'
import { ResourceController } from './resource.controller'
import { ResourceEntity } from './resource.entity'
import { ResourceService } from './resource.service'
import { ResourceSubscriber } from './resource.subscriber'
import { ResourceStatsSubscriber } from './statistics'
import { UserResourceController } from './user'
import { ResourceViewEntity, ResourceViewService } from './views'
import { ResourceWatcherController, ResourceWatcherEntity, ResourceWatcherService } from './watchers'

@Module({
  controllers: [
    ResourceFileController,
    ResourceController,
    UserResourceController,
    ResourceEventController,
    ResourceMemberController,
    ResourceInvitationController,
    ResourceWatcherController,
  ],
  providers: [
    ResourceFileService,
    ResourceService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceWatcherService,
    ResourceInvitationService,

    ResourceSubscriber,
    ResourceEventSubscriber,
    ResourceMemberSubscriber,
    ResourceStatsSubscriber,
    ResourcePermissionService,
    ResourceInvitationSubscriber,
    ResourceMemberCreateEventNotificationDataProvider,
    ResourceInvitationNotificationDataProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([
      ResourceEventEntity,
      ResourceInvitationEntity,
      ResourceMemberEntity,
      ResourceEntity,
      ResourceWatcherEntity,
      ResourceViewEntity,
    ]),
    LevelModule,
    TopicModule,
    UserModule,
  ],
  exports: [
    TypeOrmModule,
    ResourceFileService,
    ResourceService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceWatcherService,
    ResourceInvitationService,
  ],
})
export class FeatureResourceServerModule {}
