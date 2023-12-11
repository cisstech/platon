/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestResponse, NotFoundResponse } from '@platon/core/common'
import { ActivityVariables, ExerciseVariables, extractExercisesFromActivityVariables } from '@platon/feature/compiler'
import { ActivityCorrectorView, ActivityEntity, ActivityMemberView } from '@platon/feature/course/server'
import {
  ActivityResults,
  AnswerStates,
  ExerciseResults,
  UserResults,
  answerStateFromGrade,
  emptyExerciseResults,
} from '@platon/feature/result/common'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { IsNull, Not, Repository } from 'typeorm'
import { SessionEntity } from './sessions/session.entity'

// TODO rework this service to use iterator design pattern with a Agrregator classes

interface Data {
  activityUsers: ActivityMemberView[]
  activityCorrectors: ActivityCorrectorView[]
  activitySessions: SessionEntity<ActivityVariables>[]
  exerciseSessions: SessionEntity<any>[]
  activityVariables: ActivityVariables
}

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,

    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,

    @InjectRepository(ActivityMemberView)
    private readonly activityMemberView: Repository<ActivityMemberView>,

    @InjectRepository(ActivityCorrectorView)
    private readonly activityCorrectorView: Repository<ActivityCorrectorView>
  ) {}

  async sessionResults(sessionId: string): Promise<ActivityResults> {
    return this.process(await this.loadSessionData(sessionId), true)
  }

  async activityResults(activityId: string): Promise<ActivityResults> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
    })

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity: ${activity}`)
    }

    return this.process(await this.loadActivityData(activity))
  }

  private async loadSessionData(sessionId: string): Promise<Data> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { activity: true },
    })

    if (!session) {
      throw new NotFoundResponse(`Session: ${session}`)
    }

    if (session.parentId) {
      throw new BadRequestResponse(`Session: ${sessionId} is not an activity session`)
    }

    if (session.activityId && session.activity) {
      return this.loadActivityData(session.activity, session.userId)
    }

    const activitySessions = [session]
    const exerciseSessions = await this.sessionRepository.find({
      where: { parentId: sessionId },
    })

    const activityUsers: ActivityMemberView[] = [
      Object.assign(new ActivityMemberView(), {
        id: 'anonymous',
        username: 'anonymous',
        firstName: 'anonymous',
        lastName: 'anonymous',
        email: 'anonymous',
      }),
    ]

    activitySessions.forEach((session) => (session.userId = 'anonymous'))
    exerciseSessions.forEach((session) => (session.userId = 'anonymous'))

    return {
      activityUsers,
      activitySessions,
      exerciseSessions,
      activityCorrectors: [],
      activityVariables: session.variables as ActivityVariables,
    }
  }

  private async loadActivityData(activity: ActivityEntity, userId?: string): Promise<Data> {
    const [activityUsers, activitySessions, exerciseSessions, activityCorrectors] = await Promise.all([
      this.activityMemberView.find({
        where: { courseId: activity.courseId, activityId: activity.id },
      }),
      this.sessionRepository.find({
        where: {
          activityId: activity.id,
          parentId: IsNull(),
          ...(userId ? { userId } : {}),
        },
        relations: { user: true, correction: true },
      }),
      this.sessionRepository.find({
        where: {
          activityId: activity.id,
          parentId: Not(IsNull()),
          ...(userId ? { userId } : {}),
        },
        relations: { correction: true },
      }),
      this.activityCorrectorView.find({
        where: { activityId: activity.id },
      }),
    ])

    const sessionUsers = activitySessions
      .filter((session) => !userId || session.user?.id === userId)
      .filter((session) => !activityUsers.some((activityUser) => activityUser.id === session.userId))
      .map(
        (session) =>
          ({
            id: session.user?.id as string,
            username: session.user?.username as string,
            firstName: session.user?.firstName as string,
            lastName: session.user?.lastName as string,
            email: session.user?.email as string,
          } as ActivityMemberView)
      )

    activityUsers.push(...(sessionUsers as ActivityMemberView[]))

    if (userId && !activityUsers.some((user) => user.id === userId)) {
      throw new NotFoundResponse(`User: ${userId}`)
    }

    return {
      activitySessions,
      exerciseSessions,
      activityCorrectors,
      activityUsers: activityUsers.filter((user) => !userId || user.id === userId),
      activityVariables: activity.source.variables as ActivityVariables,
    }
  }

  private process(data: Data, waitForCorrections = false): ActivityResults {
    const { activityUsers, activitySessions, exerciseSessions, activityVariables, activityCorrectors } = data

    const correctionEnabled = waitForCorrections && activityCorrectors.length > 0

    const { userResults, userResultsIndex } = this.createUserResults(activityUsers)
    const { exerciseResults, exerciseResultsMapIndex } = this.createExerciseResults(activityVariables, userResults)

    const exerciseIdBySessionId = new Map<string, string>()
    const exerciseSessionCountByExerciseId = new Map<string, number>()

    activitySessions.forEach((activitySession) => {
      const navigation = activitySession.variables.navigation
      // TODO use real type instead of any
      navigation.exercises.forEach((navExercise: any) => {
        const userResults = userResultsIndex[activitySession.userId as string]
        const exerciseSession = exerciseSessions.find((session) => session.id === navExercise.sessionId)
        const correcting = correctionEnabled && !exerciseSession?.correction
        userResults.correcting = correcting ?? userResults.correcting
        if (!correcting) {
          navExercise.state = answerStateFromGrade(exerciseSession?.correction?.grade || exerciseSession?.grade)
          const userExercise = userResults.exercises[navExercise.id]
          userExercise.state = navExercise.state
        }

        exerciseIdBySessionId.set(navExercise.sessionId, navExercise.id)
        exerciseSessionCountByExerciseId.set(navExercise.id, 0)
        Object.values(AnswerStates).forEach((state) => {
          if (state === navExercise.state) {
            exerciseResultsMapIndex[navExercise.id].states[state]++
          }
        })
      })
    })

    exerciseSessions.forEach((exerciseSession) => {
      const exerciseId = exerciseIdBySessionId.get(exerciseSession.id)
      if (exerciseId) {
        exerciseSessionCountByExerciseId.set(exerciseId, (exerciseSessionCountByExerciseId.get(exerciseId) || 0) + 1)

        const duration =
          exerciseSession.lastGradedAt && exerciseSession.startedAt
            ? differenceInSeconds(exerciseSession.lastGradedAt, exerciseSession.startedAt)
            : 0

        const grade = exerciseSession.correction?.grade ?? exerciseSession.grade

        const activityExercise = exerciseResultsMapIndex[exerciseId]
        activityExercise.grades.sum += grade === -1 ? 0 : grade
        activityExercise.attempts.sum += exerciseSession.attempts
        activityExercise.durations.sum += duration

        const userResults = userResultsIndex[exerciseSession.userId as string]
        if (!userResults.correcting) {
          const userExercise = userResults.exercises[exerciseId]
          userExercise.grade = grade
          userExercise.attempts = exerciseSession.attempts
          userExercise.duration = duration
          userExercise.sessionId = exerciseSession.id
        }
      }
    })

    exerciseResults.forEach((activityExercise) => {
      const count = exerciseSessionCountByExerciseId.get(activityExercise.id)
      activityExercise.grades.avg = count ? activityExercise.grades.sum / count : activityExercise.grades.sum
      activityExercise.attempts.avg = count ? activityExercise.attempts.sum / count : activityExercise.attempts.sum
      activityExercise.durations.avg = count ? activityExercise.durations.sum / count : activityExercise.durations.sum
    })

    return { users: userResults, exercises: exerciseResults }
  }

  private createUserResults(users: ActivityMemberView[]) {
    const userResults = users.map((user) => ({ ...user, exercises: {} } as UserResults))
    const userResultsIndex = userResults.reduce((record, results) => {
      record[results.id] = results
      return record
    }, {} as Record<string, UserResults>)
    return {
      userResults,
      userResultsIndex,
    }
  }

  private createExerciseResults(activityVariables: ActivityVariables, userResults: UserResults[]) {
    const exerciseResults = extractExercisesFromActivityVariables(activityVariables).map((exercise) => {
      userResults.forEach((user) => {
        user.exercises[exercise.id] = {
          id: exercise.id,
          title: (exercise.source.variables as ExerciseVariables).title,
          grade: -1,
          attempts: 0,
          duration: 0,
          state: AnswerStates.NOT_STARTED,
        }
      })
      return {
        ...emptyExerciseResults(),
        id: exercise.id,
        title: (exercise.source.variables as ExerciseVariables).title,
      } as ExerciseResults
    })

    const exerciseResultsMapIndex = exerciseResults.reduce((record, results) => {
      record[results.id] = results
      return record
    }, {} as Record<string, ExerciseResults>)

    return {
      exerciseResults,
      exerciseResultsMapIndex,
    }
  }
}
