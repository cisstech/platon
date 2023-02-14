import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelModule, TopicModule } from '@platon/core/server';
import { ResourceEventController, ResourceEventEntity, ResourceEventService } from './events';
import { ResourceInvitationController, ResourceInvitationEntity, ResourceInvitationService } from './invitations';
import { ResourceMemberController, ResourceMemberEntity, ResourceMemberService, ResourceMemberSubscriber } from './members';
import { ResourceController } from './resource.controller';
import { ResourceEntity } from './resource.entity';
import { ResourceService } from './resource.service';
import { ResourceSubscriber } from './resource.subscriber';
import { ResourceStatsSubscriber } from './statistics';
import { UserResourceController } from './user';
import { ResourceViewEntity, ResourceViewService } from './views';
import { ResourceWatcherController, ResourceWatcherEntity, ResourceWatcherService } from './watchers';


@Module({
  controllers: [
    ResourceController,
    ResourceEventController,
    ResourceMemberController,
    ResourceInvitationController,
    UserResourceController,
    ResourceWatcherController,
  ],
  providers: [
    ResourceService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceWatcherService,
    ResourceInvitationService,

    ResourceSubscriber,
    ResourceMemberSubscriber,
    ResourceStatsSubscriber,
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
  ],
  exports: [
    ResourceService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceWatcherService,
    ResourceInvitationService,
  ],
})
export class FeatureResourceServerModule { }
