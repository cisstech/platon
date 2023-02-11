import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelModule } from '../../levels';
import { TopicModule } from '../../topics';
import { UserPrefsController } from './user-prefs.controller';
import { UserPrefsEntity } from './user-prefs.entity';
import { UserPrefsService } from './user-prefs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPrefsEntity
    ]),
    TopicModule,
    LevelModule,
  ],
  controllers: [UserPrefsController],
  providers: [
    UserPrefsService
  ],
  exports: [
    UserPrefsService
  ]
})
export class UserPrefsModule {};
