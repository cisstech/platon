import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestResponse, NotFoundResponse } from '@platon/core/common'
import { ActivityEntity, ActivityMemberView } from '@platon/feature/course/server'
import { ResourceTypes } from '@platon/feature/resource/common'
import { ResourceEntity, ResourceService } from '@platon/feature/resource/server'
import { DashboardOutput } from '@platon/feature/result/common'
import { In, IsNull, Not, Repository } from 'typeorm'
import { SessionView } from '../sessions/session.view'
import {
  ActivityExerciseResults,
  ActivityUserResults,
  ExerciseAnswerRate,
  ExerciseAverageAttempts,
  ExerciseAverageAttemptsToSuccess,
  ExerciseDropOutRate,
  ExerciseSuccessRateOnFirstAttempt,
  ExerciseTotalAttempts,
  SessionAverageDuration,
  SessionAverageScore,
  SessionDistributionByAnswerState,
  SessionSuccessRate,
} from './aggregators/session.aggregator'

@Injectable()
export class DashboardService {
  constructor(
    private readonly resourceService: ResourceService,

    @InjectRepository(SessionView)
    private readonly sessionView: Repository<SessionView>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(ActivityMemberView)
    private readonly activityMemberView: Repository<ActivityMemberView>
  ) {}

  async ofSession(sessionId: string): Promise<[SessionView, DashboardOutput]> {
    const output: DashboardOutput = {}

    const activitySession = await this.sessionView.findOne({
      where: { id: sessionId },
    })

    if (!activitySession) {
      throw new NotFoundResponse(`Session: ${sessionId}`)
    }

    if (activitySession.parentId) {
      throw new BadRequestResponse(`Session: ${sessionId} is not an activity session`)
    }

    const [activity, exerciseSessions] = await Promise.all([
      activitySession.activityId
        ? this.activityRepository.findOne({
            where: { id: activitySession.activityId },
          })
        : undefined,
      this.sessionView.find({
        where: { parentId: sessionId },
        relations: { user: true },
      }),
    ])

    const aggregators = [
      new ActivityUserResults({
        activity,
        exerciseSessions,
      }),
    ]

    aggregators.forEach((aggregator) => aggregator.next(activitySession))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })

    return [activitySession, output]
  }

  async ofResource(id: string): Promise<DashboardOutput> {
    const resource = (await this.resourceService.findById(id)).orElseThrow(
      () => new NotFoundResponse('Resource not found')
    )

    const output: DashboardOutput = {}

    if (resource.type === ResourceTypes.EXERCISE) {
      await this.ofExerciseResource(resource, output)
    }

    if (resource.type === ResourceTypes.ACTIVITY) {
      await this.ofActivityResource(resource, output)
    }

    return output
  }

  async ofActivity(activityId: string): Promise<DashboardOutput> {
    const output: DashboardOutput = {}

    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })
    if (!activity) {
      throw new NotFoundResponse(`Activity: ${activityId}`)
    }

    const [sessions, activityMembers] = await Promise.all([
      this.sessionView.find({
        where: { activityId, userId: Not(IsNull()) },
        relations: { user: true },
      }),
      this.activityMemberView.find({
        where: { courseId: activity.courseId, activityId: activity.id },
      }),
    ])

    const activitySessions = sessions.filter((session) => !session.parentId)
    const exerciseSessions = sessions.filter((session) => !!session.parentId)

    const aggregators = [
      new SessionSuccessRate(),
      new SessionAverageScore(),
      new SessionAverageDuration(),
      new SessionDistributionByAnswerState(),

      new ActivityUserResults({
        activity,
        activityMembers,
        exerciseSessions,
      }),

      new ActivityExerciseResults({
        activity,
        exerciseSessions,
      }),
    ]

    activitySessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })

    return output
  }

  private async ofExerciseResource(resource: ResourceEntity, output: DashboardOutput): Promise<void> {
    const sessions = await this.sessionView.find({
      where: {
        resourceId: resource.id,
        userId: Not(IsNull()),
      },
    })

    const aggregators = [
      new SessionSuccessRate(),
      new SessionAverageScore(),
      new SessionAverageDuration(),
      new SessionDistributionByAnswerState(),

      new ExerciseAnswerRate(),
      new ExerciseDropOutRate(),
      new ExerciseTotalAttempts(),
      new ExerciseAverageAttempts(),
      new ExerciseSuccessRateOnFirstAttempt(),
      new ExerciseAverageAttemptsToSuccess(),
    ]

    sessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })
  }

  private async ofActivityResource(resource: ResourceEntity, output: DashboardOutput): Promise<void> {
    const activitySessions = await this.sessionView.find({
      where: {
        resourceId: resource.id,
        userId: Not(IsNull()),
      },
    })

    const exerciseSessions = await this.sessionView.find({
      where: {
        parentId: In(activitySessions.map((s) => s.id)),
        userId: Not(IsNull()),
      },
    })

    const aggregators = [
      new SessionSuccessRate(),
      new SessionAverageScore(),
      new SessionAverageDuration(),
      new SessionDistributionByAnswerState(),

      new ActivityExerciseResults({
        exerciseSessions,
      }),
    ]

    activitySessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })
  }
}
