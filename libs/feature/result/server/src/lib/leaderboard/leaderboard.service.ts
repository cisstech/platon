import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@platon/core/common'
import { extractExercisesFromActivityVariables } from '@platon/feature/compiler'
import { ActivityEntity } from '@platon/feature/course/server'
import { ActivityLeaderboardEntry, CourseLeaderboardEntry } from '@platon/feature/result/common'
import { Repository } from 'typeorm'
import { LeaderboardView } from './leaderboard.view'

const DEFAULT_LEADERBOARD_LIMIT = 100

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(LeaderboardView)
    private readonly leaderboardView: Repository<LeaderboardView>,

    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>
  ) {}

  async ofCourse(id: string, limit?: number): Promise<CourseLeaderboardEntry[]> {
    const activities = await this.activityRepository.find({
      where: { courseId: id, isChallenge: true },
      select: ['id', 'source'],
    })

    const activityRanks = await Promise.all(activities.map((activity) => this.ofActivity(activity, limit)))
    const userRanks = activityRanks.reduce((acc, ranks) => {
      ranks.forEach((rank) => {
        if (acc[rank.user.id]) {
          acc[rank.user.id].points += rank.points
        } else {
          acc[rank.user.id] = { user: rank.user, points: rank.points }
        }
      })
      return acc
    }, {} as Record<string, { user: User; points: number }>)

    return Object.values(userRanks)
      .sort((a, b) => b.points - a.points)
      .map<CourseLeaderboardEntry>((user, index) => ({ rank: index + 1, user: user.user, points: user.points }))
  }

  async ofActivity(activityOrId: string | ActivityEntity, limit?: number): Promise<ActivityLeaderboardEntry[]> {
    const activity =
      typeof activityOrId === 'string'
        ? await this.activityRepository.findOneOrFail({
            where: { id: activityOrId },
            select: ['id', 'source'],
          })
        : activityOrId

    const exerciseCount = extractExercisesFromActivityVariables(activity.source.variables).length || 1

    limit = limit || DEFAULT_LEADERBOARD_LIMIT
    const views = await this.leaderboardView
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.user', 'user', 'user.id = view.user_id')
      .where('view.activity_id = :id', { id: activity.id })
      .andWhere('view.parent_id IS NULL')
      .limit(limit || DEFAULT_LEADERBOARD_LIMIT)
      .getMany()

    return views.map<ActivityLeaderboardEntry>((view, index) => ({
      rank: index + 1,
      user: view.user,
      grade: view.grade,
      points: Math.round(100 * exerciseCount + limit! - index),
      startedAt: view.startedAt,
      succeededAt: view.succeededAt,
      lastGradedAt: view.lastGradedAt,
    }))
  }
}
