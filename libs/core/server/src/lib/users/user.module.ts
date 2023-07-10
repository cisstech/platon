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
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

@Module({
  imports: [LevelModule, TopicModule, TypeOrmModule.forFeature([UserEntity, UserPrefsEntity, UserGroupEntity])],
  controllers: [UserController, UserGroupController, UserPrefsController],
  providers: [UserService, UserPrefsService, UserGroupService, UserResolver],
  exports: [UserService, UserPrefsService, UserGroupService],
})
export class UserModule {}
