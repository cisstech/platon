import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeatureCourseServerModule } from '@platon/feature/course/server'
import { AnswerEntity } from './answers/answer.entity'
import { AnswerService } from './answers/answer.service'
import { SessionCommentController } from './comments/comment.controller'
import { SessionCommentEntity } from './comments/comment.entity'
import { SessionCommentService } from './comments/comment.service'
import { CorrectionEntity } from './correction/correction.entity'
import { CorrectionService } from './correction/correction.service'
import { ResultController } from './result.controller'
import { ResultService } from './result.service'
import { SessionEntity } from './sessions/session.entity'
import { SessionService } from './sessions/session.service'
import { CorrectionController } from './correction/correction.controller'

@Module({
  imports: [
    FeatureCourseServerModule,
    TypeOrmModule.forFeature([SessionEntity, AnswerEntity, CorrectionEntity, SessionCommentEntity]),
  ],
  controllers: [ResultController, CorrectionController, SessionCommentController],
  providers: [
    ResultService,
    AnswerService,
    SessionService,
    CorrectionService,
    SessionCommentService,
  ],
  exports: [
    TypeOrmModule,
    ResultService,
    AnswerService,
    SessionService,
    CorrectionService,
    SessionCommentService,
  ],
})
export class FeatureResultServerModule {}
