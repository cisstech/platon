import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LevelController } from './level.controller'
import { LevelEntity } from './level.entity'
import { LevelService } from './level.service'
import { StringUtilsService } from '../utils'

@Module({
  controllers: [LevelController],
  providers: [LevelService, StringUtilsService],
  imports: [TypeOrmModule.forFeature([LevelEntity])],
  exports: [LevelService],
})
export class LevelModule {}
