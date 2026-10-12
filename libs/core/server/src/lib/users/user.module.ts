import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LevelModule } from '../levels'
import { TopicModule } from '../topics'
import { UserGroupEntity, UserGroupService } from './groups'
import { UserGroupController } from './groups/user-group.controller'
import { UserPrefsEntity, UserPrefsService } from './prefs'
import { UserPrefsController } from './prefs/user-prefs.controller'
import { UserController } from './user.controller'
import { UserEntity } from './user.entity'
import { UserService } from './user.service'
import { UserSchedulerService } from './user-scheduler.service'
import { UserCharterController, UserCharterEntity, UserCharterService } from './charter'

@Module({
  imports: [
    LevelModule,
    TopicModule,
    TypeOrmModule.forFeature([UserEntity, UserPrefsEntity, UserGroupEntity, UserCharterEntity]),
  ],
  controllers: [UserController, UserGroupController, UserPrefsController, UserCharterController],
  providers: [UserService, UserPrefsService, UserGroupService, UserSchedulerService, UserCharterService],
  exports: [UserService, UserPrefsService, UserGroupService],
})
export class UserModule {}
