import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ActivityService, FeatureCourseServerModule } from '@platon/feature/course/server'
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
import { LeaderboardController } from './leaderboard/leaderboard.controller'
import { LeaderboardService } from './leaderboard/leaderboard.service'
import { LeaderboardView } from './leaderboard/leaderboard.view'
import { ActivityResultsVirtualColumnsResolver } from './resolvers/activity-results-virtual-columns.resolver'
import { ResultController } from './result.controller'
import { SessionEntity } from './sessions/session.entity'
import { SessionService } from './sessions/session.service'
import { SessionView } from './sessions/session.view'
import { WatchedChallengesEntity } from 'libs/feature/discord/server/src/lib/watchedChallenges.entity'
import { WatchedChallengesService } from 'libs/feature/discord/server/src/lib/watchedChallenges.service'

@Module({
  imports: [
    FeatureCourseServerModule,
    FeatureResourceServerModule,
    TypeOrmModule.forFeature([
      SessionView,
      LeaderboardView,
      SessionEntity,
      AnswerEntity,
      CorrectionEntity,
      SessionCommentEntity,
      WatchedChallengesEntity
    ]),
  ],
  controllers: [
    ResultController,
    DashboardController,
    CorrectionController,
    LeaderboardController,
    SessionCommentController,
  ],
  providers: [
    AnswerService,
    SessionService,
    DashboardService,
    CorrectionService,
    LeaderboardService,
    SessionCommentService,
    ActivityResultsVirtualColumnsResolver,
    CourseExpander,
    ResourceExpander,
    WatchedChallengesService,
    ActivityService
  ],
  exports: [TypeOrmModule, AnswerService, SessionService, CorrectionService, SessionCommentService, LeaderboardService, WatchedChallengesService, ActivityService],
})
export class FeatureResultServerModule {}
