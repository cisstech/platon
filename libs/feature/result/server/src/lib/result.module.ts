import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureCourseServerModule } from '@platon/feature/course/server';
import { AnswerEntity } from './answers/answer.entity';
import { AnswerService } from './answers/answer.service';
import { SessionCommentEntity } from './comments/comment.entity';
import { CorrectionEntity } from './correction/correction.entity';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { SessionEntity } from './sessions/session.entity';
import { SessionService } from './sessions/session.service';

@Module({
  imports: [
    FeatureCourseServerModule,
    TypeOrmModule.forFeature([
      SessionEntity,
      AnswerEntity,
      CorrectionEntity,
      SessionCommentEntity
    ]),
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
