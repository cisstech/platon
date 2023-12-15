import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LevelModule, TopicModule, UserModule } from '@platon/core/server'
import { ResourceDependencyService } from './dependency'
import { ResourceDependencyEntity } from './dependency/dependency.entity'
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
import { ResourceMetaEntity, ResourceMetadataService } from './metadata'
import { ResourcePermissionService } from './permissions/permissions.service'
import { ResourceController } from './resource.controller'
import { ResourceEntity } from './resource.entity'
import { ResourceExpander } from './resource.expander'
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
    ResourceService,
    ResourceFileService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceWatcherService,
    ResourceMetadataService,
    ResourceDependencyService,
    ResourceInvitationService,

    ResourceExpander,

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
      ResourceMetaEntity,
      ResourceDependencyEntity,
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
    ResourceMetadataService,
    ResourceWatcherService,
    ResourceDependencyService,
    ResourceInvitationService,
  ],
})
export class FeatureResourceServerModule {}
