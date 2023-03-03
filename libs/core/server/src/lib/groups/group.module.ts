import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupEntity } from './group.entity';
import { UserGroupService } from './group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGroupEntity
    ]),
  ],
  controllers: [],
  providers: [
    UserGroupService
  ],
  exports: [
    UserGroupService,
  ]
})
export class UserGroupModule { };
