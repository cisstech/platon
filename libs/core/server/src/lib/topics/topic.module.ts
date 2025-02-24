import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TopicController } from './topic.controller'
import { TopicEntity } from './topic.entity'
import { TopicService } from './topic.service'
import { StringUtilsService } from '../utils'

@Module({
  controllers: [TopicController],
  providers: [TopicService, StringUtilsService],
  imports: [TypeOrmModule.forFeature([TopicEntity])],
  exports: [TopicService],
})
export class TopicModule {}
