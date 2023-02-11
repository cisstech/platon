import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelModule, TopicModule } from '@platon/core/server';
import { ResourceCompletionController } from './controllers/completion.controller';
import { ResourceEventController } from './controllers/event.controller';
import { ResourceInvitationController } from './controllers/invitation.controller';
import { ResourceMemberController } from './controllers/member.controller';
import { ResourceController } from './controllers/resource.controller';
import { UserResourceController } from './controllers/user.controller';
import { ResourceEventEntity } from './entities/event.entity';
import { ResourceInvitationEntity } from './entities/invitation.entity';
import { ResourceMemberEntity } from './entities/member.entity';
import { ResourceEntity } from './entities/resource.entity';
import { ResourceViewEntity } from './entities/view.entity';
import { ResourceEventService } from './services/event.service';
import { ResourceInvitationService } from './services/invitation.service';
import { ResourceMemberService } from './services/member.service';
import { ResourceService } from './services/resource.service';
import { ResourceViewService } from './services/view.service';

@Module({
  controllers: [
    ResourceController,
    ResourceEventController,
    ResourceMemberController,
    ResourceInvitationController,
    UserResourceController,
    ResourceCompletionController,
  ],
  providers: [
    ResourceService,
    ResourceViewService,
    ResourceEventService,
    ResourceMemberService,
    ResourceInvitationService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      ResourceEventEntity,
      ResourceInvitationEntity,
      ResourceMemberEntity,
      ResourceEntity,
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
    ResourceInvitationService,
  ],
})
export class FeatureResourceServerModule { }
