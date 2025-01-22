import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@platon/core/common'
import { extractExercisesFromActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity, ON_CHALLENGE_SUCCEEDED_EVENT } from '@platon/feature/course/server'
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common'
import { Repository } from 'typeorm'
import { LeaderboardView } from './leaderboard.view'
import { OnEvent } from '@nestjs/event-emitter'

const DEFAULT_LEADERBOARD_LIMIT = 100

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name)
  constructor(
    @InjectRepository(LeaderboardView)
    private readonly leaderboardView: Repository<LeaderboardView>,

    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>
  ) {}

  @OnEvent(ON_CHALLENGE_SUCCEEDED_EVENT)
  async onChallengeSucceeded() {
    this.logger.log('Refreshing leaderboard view')
    await this.leaderboardView.query(`REFRESH MATERIALIZED VIEW "LeaderboardView"`)
  }

  async ofCourse(id: string, limit: number = DEFAULT_LEADERBOARD_LIMIT): Promise<CourseLeaderboardEntry[]> {
    const activities = await this.activityRepository.find({
      where: { courseId: id, isChallenge: true },
      select: ['id'],
    })

    const userPoints = new Map<string, { user: User; points: number }>()

    for (const activity of activities) {
      const ranks = await this.ofActivity(activity.id, limit)
      ranks.forEach((rank) => {
        if (!userPoints.has(rank.user.id)) {
          userPoints.set(rank.user.id, { user: rank.user, points: 0 })
        }
        userPoints.get(rank.user.id)!.points += rank.points
      })
    }

    return Array.from(userPoints.values())
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        rank: index + 1,
        user: entry.user,
        points: entry.points,
      }))
  }

  async ofActivity(activityId: string, limit: number = DEFAULT_LEADERBOARD_LIMIT): Promise<ActivityLeaderboardEntry[]> {
    const activity = await this.activityRepository.findOneOrFail({
      where: { id: activityId },
      select: ['source'],
    })

    const exerciseCount = extractExercisesFromActivityVariables(activity.source.variables).length || 1

    const entries = await this.leaderboardView
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.user', 'user')
      .where('view.activityId = :activityId', { activityId })
      .orderBy('view.succeeded_at', 'ASC')
      .limit(limit)
      .getMany()

    return entries.map<ActivityLeaderboardEntry>((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      grade: entry.grade,
      points: Math.round(100 * exerciseCount + limit - index),
      startedAt: entry.startedAt,
      succeededAt: entry.succeededAt,
      lastGradedAt: entry.lastGradedAt,
    }))
  }
}
