/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ForbiddenResponse, NotFoundResponse, User, isTeacherRole } from '@platon/core/common'
import { EventService, UserEntity } from '@platon/core/server'
import {
  ACTIVITY_FILE_EXTENSION,
  ActivityExercise,
  ExerciseVariables,
  PLSourceFile,
  Variables,
  extractExercisesFromActivityVariables,
} from '@platon/feature/compiler'
import { Activity } from '@platon/feature/course/common'
import {
  ActivityEntity,
  ActivityService,
  ON_RELOAD_ACTIVITY_EVENT,
  ON_TERMINATE_ACTIVITY_EVENT,
  OnReloadActivityEventPayload,
  OnTerminateActivityEventPayload,
} from '@platon/feature/course/server'
import {
  ExercisePlayer,
  PlayActivityOuput,
  PlayExerciseOuput,
  PlayerActivityVariables,
  PlayerExercise,
  PlayerManager,
  PreviewInput,
  updateActivityNavigationState,
  withActivityPlayer,
  withExercisePlayer,
  withSessionAccessGuard,
} from '@platon/feature/player/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { Answer, AnswerStates, ExerciseSession, Session } from '@platon/feature/result/common'
import {
  AnswerService,
  CorrectionEntity,
  ExerciseSessionEntity,
  SessionEntity,
  SessionService,
} from '@platon/feature/result/server'
import { PartialDeep } from 'type-fest'
import { DataSource, EntityManager, In } from 'typeorm'
import { PreviewOuputDTO } from './player.dto'
import { SandboxService } from './sandboxes/sandbox.service'

type CreateSessionArgs = {
  user?: User | null
  source: PLSourceFile
  parentId?: string | null
  overrides?: Variables | null
  activity?: ActivityEntity | null
  isBuilt?: boolean | null
}

@Injectable()
export class PlayerService extends PlayerManager {
  protected readonly logger = new Logger(PlayerService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventService: EventService,
    private readonly sandboxService: SandboxService,
    private readonly answerService: AnswerService,
    private readonly sessionService: SessionService,
    private readonly activityService: ActivityService,
    private readonly resourceFileService: ResourceFileService
  ) {
    super(sandboxService)
  }

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
          await this.sessionService.findExerciseSessionByActivityId(activitySessionId, sessionId),
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

  protected createAnswer(answer: Partial<Answer>): Promise<Answer> {
    return this.answerService.create(answer)
  }

  protected updateSession(sessionId: string, changes: PartialDeep<Session>): Promise<void> {
    return this.sessionService.update(sessionId, changes)
  }

  protected findGrades(sessionId: string): Promise<number[]> {
    return this.answerService.findGradesOfSession(sessionId)
  }

  protected findSessionById(sessionId: string): Promise<Session | null | undefined> {
    return this.sessionService.findById(sessionId, { parent: true, activity: true })
  }

  protected findSessionsByParentId(parentId: string): Promise<Session[]> {
    return this.sessionService.findAllWithParent(parentId)
  }

  protected findExerciseSessionById(id: string): Promise<ExerciseSession | null | undefined> {
    return this.sessionService.findExerciseSessionById(id, { parent: true, activity: true })
  }

  protected override onTerminate(activity: Activity): void {
    this.eventService.emit<OnTerminateActivityEventPayload>(ON_TERMINATE_ACTIVITY_EVENT, {
      activity,
    })
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

  /**
   * Builds the given ExerciseSession
   */
  private async buildExercise(exerciseSession: ExerciseSessionEntity): Promise<SessionEntity> {
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
    const runWithEntityManager = async (manager: EntityManager): Promise<SessionEntity> => {
      const { user, source, parentId, activity, isBuilt } = args

      source.variables.seed = (Number.parseInt(source.variables.seed + '') || Date.now()) % 100

      const session = await this.sessionService.create(
        {
          activity,
          variables: source.variables as Variables,
          envid: null,
          userId: user?.id || null,
          parentId: parentId || null,
          activityId: activity?.id || null,
          source,
          isBuilt: isBuilt || false,
        },
        manager
      )

      if (source.abspath.endsWith(ACTIVITY_FILE_EXTENSION)) {
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
    return entityManager ? runWithEntityManager(entityManager) : this.dataSource.transaction(runWithEntityManager)
  }

  /**
   * Ensures that a session is created for each exercices of the given activity navigation for `user`.
   * @param variables Activity variables.
   * @returns Computed variables.
   */
  private async createNavigation(
    variables: PlayerActivityVariables,
    activitySession: SessionEntity,
    user?: User | null,
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
}
