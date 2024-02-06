import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeatureCourseServerModule } from '@platon/feature/course/server'
import { FeatureResourceServerModule } from '@platon/feature/resource/server'
import { AnswerEntity } from './answers/answer.entity'
import { AnswerService } from './answers/answer.service'
import { SessionCommentController } from './comments/comment.controller'
import { SessionCommentEntity } from './comments/comment.entity'
import { SessionCommentService } from './comments/comment.service'
import { CorrectionController } from './correction/correction.controller'
import { CorrectionEntity } from './correction/correction.entity'
import { CorrectionService } from './correction/correction.service'
import { DashboardController } from './dashboard/dashboard.controller'
import { DashboardService } from './dashboard/dashboard.service'
import { CourseExpander } from './expanders/course.expander'
import { ResourceExpander } from './expanders/resource.expander'
import { ActivityResultsVirtualColumnsResolver } from './resolvers/activity-results-virtual-columns.resolver'
import { ResultController } from './result.controller'
import { SessionRankView } from './sessions/session-rank.view'
import { SessionEntity } from './sessions/session.entity'
import { SessionService } from './sessions/session.service'
import { SessionView } from './sessions/session.view'

@Module({
  imports: [
    FeatureCourseServerModule,
    FeatureResourceServerModule,
    TypeOrmModule.forFeature([
      SessionView,
      SessionRankView,
      SessionEntity,
      AnswerEntity,
      CorrectionEntity,
      SessionCommentEntity,
    ]),
  ],
  controllers: [ResultController, DashboardController, CorrectionController, SessionCommentController],
  providers: [
    AnswerService,
    SessionService,
    DashboardService,
    CorrectionService,
    SessionCommentService,
    ActivityResultsVirtualColumnsResolver,

    CourseExpander,
    ResourceExpander,
  ],
  exports: [TypeOrmModule, AnswerService, SessionService, CorrectionService, SessionCommentService],
})
export class FeatureResultServerModule {}
