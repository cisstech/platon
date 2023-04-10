import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { AnswerEntity } from './answers/answer.entity';
import { AnswerService } from './answers/answer.service';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { SessionEntity } from './sessions/session.entity';
import { SessionService } from './sessions/session.service';

@Module({
  imports: [
    FeatureCourseServerModule,
    TypeOrmModule.forFeature([SessionEntity, AnswerEntity]),
  ],
  controllers: [ResultController],
  providers: [
    ResultService,
    AnswerService,
    SessionService
  ],
  exports: [
    ResultService,
    AnswerService,
    SessionService,
    TypeOrmModule
  ],
})
export class FeatureResultServerModule { }
