/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ForbiddenResponse, NotFoundResponse, User, isTeacherRole } from '@platon/core/common'
import { EventService, UserEntity } from '@platon/core/server'
import {
  ActivityExercise,
  ActivityVariables,
  ExerciseVariables,
  PLSourceFile,
  Variables,
  extractExercisesFromActivityVariables,
  patchExerciseMeta,
} from '@platon/feature/compiler'
import {
  ActivityEntity,
  ActivityService,
  ON_RELOAD_ACTIVITY_EVENT,
  ON_TERMINATE_ACTIVITY_EVENT,
  OnReloadActivityEventPayload,
  OnTerminateActivityEventPayload,
} from '@platon/feature/course/server'
import {
  EvalExerciseInput,
  ExercisePlayer,
  PlayActivityOuput,
  PlayExerciseOuput,
  PlayerActions,
  PlayerActivityVariables,
  PlayerExercise,
  PlayerNavigation,
  PreviewInput,
} from '@platon/feature/player/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { AnswerStates, answerStateFromGrade } from '@platon/feature/result/common'
import {
  AnswerService,
  CorrectionEntity,
  ExerciseSession,
  SessionEntity,
  SessionService,
} from '@platon/feature/result/server'
import { DataSource, EntityManager, In } from 'typeorm'
import { withAnswersInSession } from './player-answer'
import { withActivityFeedbacksGuard, withMultiSessionGuard, withSessionAccessGuard } from './player-guards'
import { updateActivityNavigationState } from './player-navigation'
import { withActivityPlayer, withExercisePlayer } from './player-renderer'
import { extractExerciseSourceFromSession } from './player-utils'
import { PreviewOuputDTO } from './player.dto'
import { SandboxService } from './sandboxes/sandbox.service'

type ActionHandler = (
  session: ExerciseSession,
  user?: User
) => Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]>

interface CreateSessionArgs {
  user?: User
  source: PLSourceFile
  parentId?: string
  overrides?: Variables
  activity?: ActivityEntity
  isBuilt?: boolean
}

@Injectable()
export class PlayerService {
  protected readonly logger = new Logger(PlayerService.name)
  private readonly actionHandlers: Record<PlayerActions, ActionHandler> = {
    NEXT_HINT: this.nextHint.bind(this),
    CHECK_ANSWER: this.checkAnswer.bind(this),
    NEXT_EXERCISE: this.nextExercise.bind(this),
    SHOW_SOLUTION: this.showSolution.bind(this),
    REROLL_EXERCISE: this.reroll.bind(this),
  }

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventService: EventService,
    private readonly sandboxService: SandboxService,
    private readonly answerService: AnswerService,
    private readonly sessionService: SessionService,
    private readonly activityService: ActivityService,
    private readonly resourceFileService: ResourceFileService
  ) {}

  async answers(sessionId: string): Promise<ExercisePlayer[]> {
    const session = await this.sessionService.findById<ExerciseVariables>(sessionId, {
      parent: true,
      activity: true,
      correction: true,
    })
    if (!session) throw new NotFoundResponse('Session not found')
    const answers = await this.answerService.findAllOfSession(sessionId)
    return answers.map((answer) => withExercisePlayer(session, answer))
  }

  /**
   * Creates new player session for the given resource for preview purpose.
   *
   * Note :
   *
   * The created session will not be linked to any user.
   * @param input Informations about the resource to preview.
   * @returns A player layout for the resource.
   */
  async preview(input: PreviewInput, user?: UserEntity): Promise<PreviewOuputDTO> {
    const { source, resource } = await this.resourceFileService.compile({
      version: input.version,
      resourceId: input.resource,
      overrides: input.overrides,
    })

    if (!resource.publicPreview && (!user || !isTeacherRole(user?.role))) {
      throw new ForbiddenResponse('You are not allowed to preview this resource')
    }

    let session = await this.createNewSession({ source })
    if (resource.type === 'EXERCISE') {
      session = await this.buildExercise(session)
    }

    return {
      exercise: resource.type === 'EXERCISE' ? withExercisePlayer(session) : undefined,
      activity: resource.type === 'ACTIVITY' ? withActivityPlayer(session) : undefined,
    }
  }

  async playActivity(activityId: string, user: User): Promise<PlayActivityOuput> {
    let activitySession = await this.sessionService.findUserActivity(activityId, user.id)
    if (!activitySession) {
      const activity = await this.activityService.findById(activityId, user)
      activitySession = await this.createNewSession({
        user,
        activity,
        source: activity.source,
        isBuilt: true,
      })
    }
    return { activity: withActivityPlayer(activitySession) }
  }

  async playExercises(
    activitySessionId: string,
    exerciseSessionIds: string[],
    user?: User
  ): Promise<PlayExerciseOuput> {
    const activitySession = await this.sessionService.findById<PlayerActivityVariables>(activitySessionId, {
      parent: false,
      activity: true,
    })
    if (!activitySession) {
      throw new NotFoundResponse(`ActivitySession not found: ${activitySessionId}`)
    }

    // CREATE PLAYERS
    const exercisePlayers = await Promise.all(
      exerciseSessionIds.map(async (sessionId) => {
        let exerciseSession = withSessionAccessGuard(
          await this.sessionService.findExercise(activitySessionId, sessionId),
          user
        )

        if (!exerciseSession.isBuilt) {
          exerciseSession = await this.buildExercise(exerciseSession)
        }

        exerciseSession.parent = activitySession
        exerciseSession.startedAt = exerciseSession.startedAt || new Date()

        await this.sessionService.update(exerciseSession.id, { startedAt: exerciseSession.startedAt })

        return withExercisePlayer(exerciseSession)
      })
    )

    // UPDATE ACTIVITY NAVIGATION
    const activityVariables = activitySession.variables
    updateActivityNavigationState(activityVariables, exerciseSessionIds[0])
    activitySession.variables = activityVariables
    activitySession.startedAt = activitySession.startedAt || new Date()
    await this.sessionService.update(activitySessionId, {
      variables: activitySession.variables,
      startedAt: activitySession.startedAt,
    })

    return {
      exercises: exercisePlayers,
      navigation: activityVariables.navigation,
    }
  }

  async terminate(sessionId: string, user?: User): Promise<PlayActivityOuput> {
    const session = withSessionAccessGuard(
      await this.sessionService.findById(sessionId, { parent: true, activity: true }),
      user
    )

    const activitySession = session.parent || session
    const activityVariables = activitySession.variables as PlayerActivityVariables
    if (activityVariables.navigation.terminated) {
      return { activity: withActivityPlayer(activitySession) }
    }

    activityVariables.navigation.terminated = true
    activitySession.variables = activityVariables
    await this.sessionService.update(activitySession.id, {
      variables: activitySession.variables,
    })

    if (activitySession.activity) {
      this.eventService.emit<OnTerminateActivityEventPayload>(ON_TERMINATE_ACTIVITY_EVENT, {
        activity: activitySession.activity,
      })
    }

    return {
      activity: withActivityPlayer(activitySession),
    }
  }

  async evaluate(input: EvalExerciseInput, user?: User): Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]> {
    const session = withSessionAccessGuard<ExerciseVariables>(
      await this.sessionService.findById<ExerciseVariables>(input.sessionId, { parent: true, activity: true }),
      user
    )

    const grades = await this.answerService.findGradesOfSession(session.id)

    withAnswersInSession(session, input.answers || {})
    patchExerciseMeta(session.variables, () => ({ grades, totalAttempts: session.attempts }))

    return this.actionHandlers[input.action](session, user)
  }

  async reroll(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    const envid = exerciseSession.envid
    const source = extractExerciseSourceFromSession(exerciseSession)

    let variables = (source?.variables as ExerciseVariables) ?? exerciseSession.variables
    variables.seed = Date.now() % 100

    if (variables.builder?.trim()) {
      patchExerciseMeta(variables, () => ({ isInitialBuild: false }))
      const output = await this.sandboxService.run({ envid, variables }, variables.builder)
      variables = output.variables as ExerciseVariables
    }

    await this.sessionService.update(exerciseSession.id, {
      variables: (exerciseSession.variables = variables),
    })

    return withExercisePlayer(exerciseSession)
  }

  async nextHint(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    const envid = exerciseSession.envid
    let variables = exerciseSession.variables

    if (Array.isArray(variables.hint)) {
      if (variables.hint.length) {
        patchExerciseMeta(variables, (meta) => ({ consumedHints: meta.consumedHints + 1 }))
      }
    } else if (variables.hint?.next?.trim()) {
      const output = await this.sandboxService.run({ envid, variables }, variables.hint.next)
      patchExerciseMeta(output.variables, (meta) => ({ consumedHints: meta.consumedHints + 1 }))
      variables = output.variables as ExerciseVariables
    }

    await this.sessionService.update(exerciseSession.id, {
      variables: (exerciseSession.variables = variables),
    })

    return withExercisePlayer(exerciseSession)
  }

  async checkAnswer(exerciseSession: ExerciseSession): Promise<[ExercisePlayer, PlayerNavigation]> {
    const { activitySession, activityNavigation } = withMultiSessionGuard(exerciseSession)

    // EVAL ANSWERS

    const envid = exerciseSession.envid
    let variables = exerciseSession.variables
    variables.feedback = { type: 'info', content: '' }

    const output = await this.sandboxService.run({ envid, variables }, variables.grader)
    const grade = Number.parseInt(output.variables.grade) ?? -1
    const increment = grade > -1 ? 1 : 0

    variables = output.variables as ExerciseVariables

    patchExerciseMeta(variables, (meta) => ({
      attempts: meta.attempts + increment,
    }))

    exerciseSession.grade = Math.max(grade, exerciseSession.grade ?? -1)
    exerciseSession.attempts += increment
    exerciseSession.variables = variables

    // SAVE ANSWER WITH GRADE

    const answer = await this.answerService.create({
      grade,
      userId: exerciseSession.userId,
      sessionId: exerciseSession.id,
      variables: exerciseSession.variables,
    })

    const promises: Promise<unknown>[] = [
      this.sessionService.update(exerciseSession.id, {
        grade: exerciseSession.grade,
        attempts: exerciseSession.attempts,
        variables: exerciseSession.variables,
        lastGradedAt: new Date(),
      }),
    ]

    // UPDATE NAVIGATION ACCORDING TO GRADE

    if (activitySession && activityNavigation) {
      const current = activityNavigation.exercises.find((item) => item.sessionId === exerciseSession.id)
      if (current) {
        current.state = answerStateFromGrade(answer.grade)
        activityNavigation.exercises = activityNavigation.exercises.map((item) =>
          item.sessionId === current.sessionId ? current : item
        )
      }

      const childs = await this.sessionService.findAllWithParent(activitySession.id)
      activitySession.grade = grade
      childs.forEach((child) => {
        if (child.id !== exerciseSession.id && typeof child.grade === 'number' && child.grade !== -1) {
          activitySession.grade += child.grade
        }
      })

      if (activitySession.grade && activitySession.grade > 0 && childs.length) {
        activitySession.grade /= childs.length
      }

      activitySession.attempts += increment
      promises.push(
        this.sessionService.update(activitySession.id, {
          grade: activitySession.grade,
          attempts: activitySession.attempts,
          variables: {
            ...activitySession.variables,
            navigation: activityNavigation,
          } as PlayerActivityVariables,
          lastGradedAt: new Date(),
        })
      )
    }

    await Promise.all(promises)

    return [
      withExercisePlayer(exerciseSession),
      activitySession ? withActivityFeedbacksGuard<ActivityVariables>(activitySession).variables.navigation : undefined,
    ]
  }

  async nextExercise(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    const activitySession = exerciseSession.parent
    if (!activitySession) {
      throw new ForbiddenResponse(`This action can be called only with dynamic activities.`)
    }

    activitySession.activity = activitySession.activity ?? exerciseSession.activity

    return withExercisePlayer(exerciseSession)
  }

  async showSolution(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    patchExerciseMeta(exerciseSession.variables, () => ({ showSolution: true }))
    return withExercisePlayer(exerciseSession)
  }

  /**
   * Builds the given ExerciseSession
   */
  private async buildExercise(exerciseSession: ExerciseSession): Promise<SessionEntity> {
    const { envid, variables } = await this.sandboxService.build(exerciseSession.source!)

    exerciseSession.envid = envid
    exerciseSession.isBuilt = true
    exerciseSession.variables = variables

    await this.sessionService.update(exerciseSession.id, {
      envid: envid || undefined,
      variables,
      isBuilt: true,
    })

    return exerciseSession
  }

  /**
   * Builds the given resource and creates new session.
   * @param args Build args.
   * @returns An player instance for the created session.
   */
  private async createNewSession(args: CreateSessionArgs, entityManager?: EntityManager): Promise<SessionEntity> {
    const create = async (manager: EntityManager): Promise<SessionEntity> => {
      const { user, source, parentId, activity, isBuilt } = args

      source.variables.seed = (Number.parseInt(source.variables.seed + '') || Date.now()) % 100

      const session = await this.sessionService.create(
        {
          activity,
          variables: source.variables as Variables,
          envid: null as any,
          userId: user?.id || (null as any),
          parentId: parentId || (null as any),
          activityId: activity?.id || (null as any),
          source,
          isBuilt: isBuilt || false,
        },
        manager
      )

      if (source.abspath.endsWith('.pla')) {
        session.variables = await this.createNavigation(
          source.variables as PlayerActivityVariables,
          session,
          user,
          manager
        )

        await this.sessionService.update(session.id, { variables: session.variables as any }, manager)
      }

      return session
    }
    return entityManager ? create(entityManager) : this.dataSource.transaction(create)
  }

  /**
   * Ensures that a session is created for each exercices of the given activity navigation for `user`.
   * @param variables Activity variables.
   * @returns Computed variables.
   */
  private async createNavigation(
    variables: PlayerActivityVariables,
    activitySession: SessionEntity,
    user?: User,
    manager?: EntityManager
  ): Promise<PlayerActivityVariables> {
    const navigation = variables.navigation || {}
    navigation.started = navigation.started ?? false
    navigation.terminated = navigation.terminated ?? false

    const exercises = (navigation.exercises || []) as (PlayerExercise | ActivityExercise)[]

    if (!exercises.length) {
      exercises.push(...extractExercisesFromActivityVariables(variables))
    }

    navigation.exercises = await Promise.all(
      exercises.map(async (item) => {
        if (!('sessionId' in item)) {
          const session = await this.createNewSession(
            {
              activity: activitySession.activity,
              parentId: activitySession.id,
              source: item.source,
              user,
            },
            manager
          )
          return {
            id: item.id,
            title: item.source.variables.title as string,
            state: AnswerStates.NOT_STARTED,
            sessionId: session.id,
          }
        }
        return item
      })
    )

    return {
      ...variables,
      navigation,
    }
  }

  @OnEvent(ON_RELOAD_ACTIVITY_EVENT)
  protected async onReloadActivity(payload: OnReloadActivityEventPayload): Promise<void> {
    const { activity } = payload
    this.dataSource.transaction(async (manager) => {
      this.logger.log(`Reload activity ${activity.id}`)
      const sessions = await manager.find(SessionEntity, {
        where: { activityId: activity.id },
      })
      this.logger.log(`Delete ${sessions.length} sessions`)
      await Promise.all([
        manager.delete(SessionEntity, { activityId: activity.id }),
        manager.delete(CorrectionEntity, {
          id: In(sessions.map((s) => s.correctionId).filter((id) => !!id) as string[]),
        }),
      ])
    })
  }
}
