/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ForbiddenResponse, NotFoundResponse, User, isTeacherRole } from '@platon/core/common'
import { EventService, UserEntity } from '@platon/core/server'
import {
  ACTIVITY_FILE_EXTENSION,
  ActivityExercise,
  ActivityVariables,
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
  NextOutput,
  PlayActivityOuput,
  PlayExerciseOuput,
  PlayerActivityVariables,
  PlayerExercise,
  PlayerManager,
  PlayerNavigation,
  PreviewInput,
  SandboxEnvironment,
  updateActivityNavigationState,
  withActivityFeedbacksGuard,
  withActivityPlayer,
  withExercisePlayer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withSessionAccessGuard,
} from '@platon/feature/player/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { Answer, AnswerStates, ExerciseSession, Session } from '@platon/feature/result/common'
import {
  ActivitySessionEntity,
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
import { randomInt } from 'crypto'
import { PeerService } from '@platon/feature/peer/server'
import { MatchStatus, PeerContest } from '@platon/feature/peer/common'

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
    private readonly resourceFileService: ResourceFileService,
    private readonly peerService: PeerService
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

  async downloadEnvironment(sessionId: string, _user: User): Promise<SandboxEnvironment> {
    const session = await this.sessionService.findById(sessionId, { parent: true, activity: true })
    if (!session) throw new NotFoundResponse('Session not found')
    if (!session.envid) throw new NotFoundResponse(`Environment not found for session ${sessionId}`)

    return this.sandboxService.downloadEnvironment(session.source as PLSourceFile<ExerciseVariables>, session.envid)
  }

  async playActivity(activityId: string, user: User): Promise<PlayActivityOuput> {
    let activitySession = await this.sessionService.findUserActivity(activityId, user.id)
    if (!activitySession) {
      const activity = await this.activityService.findByIdForUser(activityId, user)

      activitySession = await this.createNewSession({
        user,
        activity,
        source: activity.source,
        isBuilt: true,
      })
    }
    return { activity: withActivityPlayer(activitySession) }
  }

  async getSession(sessionId: string, _user: User): Promise<PlayExerciseOuput> {
    // TODO: deal with user access
    const exerciseSession = (await this.sessionService.findById(sessionId, {
      parent: true,
      activity: true,
    })) as ExerciseSessionEntity
    if (!exerciseSession) throw new NotFoundResponse('Session not found')

    return { exercises: [withExercisePlayer(exerciseSession)] }
  }

  async playExercises(
    activitySessionId: string,
    exerciseSessionIds: string[],
    _user?: User
  ): Promise<PlayExerciseOuput> {
    const activitySession = await this.sessionService.findById<PlayerActivityVariables>(activitySessionId, {
      parent: false,
      activity: true,
    })
    if (!activitySession) {
      throw new NotFoundResponse(`ActivitySession not found: ${activitySessionId}`)
    }
    if (activitySession.activity?.openAt && activitySession.activity.openAt > new Date()) {
      throw new ForbiddenResponse("L'activité n'est pas encore ouverte.")
    }
    if (activitySession.activity?.closeAt && activitySession.activity.closeAt < new Date()) {
      throw new ForbiddenResponse("L'activité est fermée.")
    }

    // CREATE PLAYERS
    const exercisePlayers = await Promise.all(
      exerciseSessionIds.map(async (sessionId) => {
        let exerciseSession = await this.sessionService.findById<ExerciseVariables>(sessionId, {}) // TODO: deal with user access
        if (!exerciseSession) {
          throw new NotFoundResponse(`ExerciseSession not found: ${sessionId}`)
        }

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

  async playNext(activitySessionId: string, _user: User): Promise<NextOutput> {
    const activitySession = await this.sessionService.findById<PlayerActivityVariables>(activitySessionId, {
      parent: false,
      activity: true,
    })
    if (!activitySession) {
      throw new NotFoundResponse(`ActivitySession not found: ${activitySessionId}`)
    }
    if (activitySession.activity?.openAt && activitySession.activity.openAt > new Date()) {
      throw new ForbiddenResponse("L'activité n'est pas encore ouverte.")
    }
    if (activitySession.activity?.closeAt && activitySession.activity.closeAt < new Date()) {
      throw new ForbiddenResponse("L'activité est fermée.")
    }

    const session = await this.buildNext(activitySession)

    return { nextExerciseId: session.variables.nextExerciseId, terminated: session.variables.navigation.terminated }
  }

  async compareTrainOrWait(
    activitySession: Session<ActivityVariables>,
    navigation: PlayerNavigation | undefined,
    comparisonSessionId: string | undefined,
    waitingExerciseSessionId: string | undefined,
    trainingExercisesSessionId: (string | undefined)[]
  ): Promise<[ExercisePlayer, PlayerNavigation]> {
    if (!activitySession.userId || !activitySession.activityId) {
      throw new ForbiddenResponse(`Peer activities doesn't work in preview mode.`)
    }
    // If we find answers to compare in the peer table, we return the next exercise
    const nextCopy: PeerContest | null = await this.peerService.getNextCopy(
      activitySession.userId,
      activitySession.activityId
    )
    if (nextCopy) {
      const nav = withActivityFeedbacksGuard<ActivityVariables>(activitySession).variables
        .navigation as PlayerNavigation
      if (nav.exercises) {
        // add the next copy to the navigation
        nav.exercises = [
          ...nav.exercises.filter((e) => !e.peerComparison), // remove the previous comparison
          {
            id: nextCopy.peerId,
            title: 'Exercice A',
            state: AnswerStates.NOT_STARTED,
            sessionId: nextCopy.answerP1,
            peerComparison: true,
          },
          {
            id: nextCopy.peerId,
            title: 'Exercice B',
            state: AnswerStates.NOT_STARTED,
            sessionId: nextCopy.answerP2,
            peerComparison: true,
          },
        ]
      }

      const nextExerciseSession = await this.sessionService.findById<ExerciseVariables>(comparisonSessionId ?? '', {})
      if (!nextExerciseSession) {
        throw new NotFoundResponse(`Next exercise not found: ${comparisonSessionId}`)
      }
      nav.current = {
        id: nextCopy.peerId,
        title: nextExerciseSession.source.variables.title as string,
        state: AnswerStates.NOT_STARTED,
        sessionId: nextExerciseSession.id,
      }

      return [
        { reviewMode: true, ...withExercisePlayer(nextExerciseSession) },
        nav ?? activitySession.variables.navigation,
      ]
    } else {
      // if there's no answers to compare we return a training exerise, if there's no training exercise we return a waiting exercise

      if (trainingExercisesSessionId.length > 0) {
        const nextExerciseSession = await this.sessionService.findById<ExerciseVariables>(
          trainingExercisesSessionId.pop() ?? '',
          {}
        )
        if (!nextExerciseSession) {
          throw new NotFoundResponse(`Next exercise not found: ${trainingExercisesSessionId}`)
        }
        if (navigation) {
          navigation.exercises = navigation?.exercises.filter((e) => !e.peerComparison)
          navigation.current = {
            id: nextExerciseSession.id,
            title: nextExerciseSession.source.variables.title as string,
            state: AnswerStates.NOT_STARTED,
            sessionId: nextExerciseSession.id,
          }
        }
        return [withExercisePlayer(nextExerciseSession), navigation ?? activitySession.variables.navigation]
      }
      const nextExerciseSession = await this.sessionService.findById<ExerciseVariables>(
        waitingExerciseSessionId ?? '',
        {}
      )
      if (!nextExerciseSession) {
        throw new NotFoundResponse(`Next exercise not found: ${waitingExerciseSessionId}`)
      }

      if (navigation) {
        navigation.exercises = navigation?.exercises.filter((e) => !e.peerComparison)
        navigation.current = {
          id: nextExerciseSession.id,
          title: nextExerciseSession.source.variables.title as string,
          state: AnswerStates.NOT_STARTED,
          sessionId: nextExerciseSession.id,
        }
      }
      return [withExercisePlayer(nextExerciseSession), navigation ?? activitySession.variables.navigation]
    }
  }

  async nextPeerExercise(
    exerciseSession: ExerciseSession,
    navigation: PlayerNavigation | undefined,
    answer: Answer
  ): Promise<[ExercisePlayer, PlayerNavigation]> {
    const activitySession = exerciseSession.parent
    if (!activitySession) {
      throw new ForbiddenResponse(`This action can be called only with peer activities.`)
    }
    if (!activitySession.userId || !activitySession.activityId) {
      throw new ForbiddenResponse(`Peer activities doesn't work in preview mode.`)
    }

    if (answer.grade !== 100) {
      // If the answer is not correct we return the same exercise
      return [
        withExercisePlayer(exerciseSession),
        navigation ||
          (withActivityFeedbacksGuard<ActivityVariables>(activitySession).variables.navigation as PlayerNavigation),
      ]
    }

    let exercice = ''
    let comparison = ''
    let trainingExercises: string[] = []
    let waitingExercise = ''

    for (const group of Object.keys(activitySession.variables.exerciseGroups)) {
      const groupName = activitySession.variables.exerciseGroups[group].name
      if (groupName === 'exercice' && activitySession.variables.exerciseGroups[group].exercises.length > 0) {
        exercice = activitySession.variables.exerciseGroups[group].exercises.at(0)!.id
      }
      if (groupName === 'comparaison' && activitySession.variables.exerciseGroups[group].exercises.length > 0) {
        comparison = activitySession.variables.exerciseGroups[group].exercises.at(0)!.id
      }
      if (groupName === 'attente' && activitySession.variables.exerciseGroups[group].exercises.length > 0) {
        waitingExercise = activitySession.variables.exerciseGroups[group].exercises.at(0)!.id
      }
      if (groupName === 'entrainement' && activitySession.variables.exerciseGroups[group].exercises.length > 0) {
        trainingExercises = activitySession.variables.exerciseGroups[group].exercises.map((e) => e.id)
      }
    }

    const exerciceSessionId = navigation?.exercises.filter((e) => e.id === exercice).pop()?.sessionId
    const comparisonSessionId = navigation?.exercises.filter((e) => e.id === comparison).pop()?.sessionId
    const waitingExerciseSessionId = navigation?.exercises.filter((e) => e.id === waitingExercise).pop()?.sessionId
    const trainingExercisesSessionId = trainingExercises
      .map((e) => navigation?.exercises.find((ex) => ex.id === e)?.sessionId)
      .filter((e) => e)
    const remainingTrainingExercisesSessionId = trainingExercises
      .map((e) => navigation?.exercises.find((ex) => ex.id === e && ex.state !== 'SUCCEEDED')?.sessionId)
      .filter((e) => e)

    switch (exerciseSession.id) {
      case exerciceSessionId: {
        // Register the answer in the peer table
        const peerlike = {
          activityId: activitySession.activityId,
          level: 0,
          correctorId: activitySession.userId,
          player1Id: activitySession.userId,
          player1SessionId: answer.sessionId,
          player2Id: activitySession.userId,
          player2SessionId: answer.sessionId,
          winnerId: activitySession.userId,
          winnerSessionId: answer.sessionId,
          status: MatchStatus.Next,
        }
        const _peer = await this.peerService.createMatch(peerlike)
        return this.compareTrainOrWait(
          activitySession,
          navigation,
          comparisonSessionId,
          waitingExerciseSessionId,
          remainingTrainingExercisesSessionId
        )
      }
      case waitingExerciseSessionId: {
        return this.compareTrainOrWait(
          activitySession,
          navigation,
          comparisonSessionId,
          waitingExerciseSessionId,
          remainingTrainingExercisesSessionId
        )
      }
      case comparisonSessionId: {
        const winner = (exerciseSession.variables as any)?.peer_winner_
        const peerId = navigation?.exercises.filter((e) => e.peerComparison).at(0)?.id
        if (!winner || winner < 0) {
          throw new ForbiddenResponse('The winner is not defined in the exercise')
        }
        if (!peerId) {
          throw new ForbiddenResponse('The current exercise did not compare any answer')
        }
        await this.peerService.resolveGame(peerId, winner) // Save the answer in the peer table
        return this.compareTrainOrWait(
          activitySession,
          navigation,
          comparisonSessionId,
          waitingExerciseSessionId,
          remainingTrainingExercisesSessionId
        )
      }
      default:
        if (trainingExercisesSessionId.includes(exerciseSession.id)) {
          return this.compareTrainOrWait(
            activitySession,
            navigation,
            comparisonSessionId,
            waitingExerciseSessionId,
            remainingTrainingExercisesSessionId
          )
        }
        break
    }
    return [withExercisePlayer(exerciseSession), activitySession.variables.navigation]
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
    this.dataSource
      .transaction(async (manager) => {
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
      .catch((error) => {
        this.logger.error('Error while reloading activity', error)
      })
  }

  /**
   * Builds the given ExerciseSession
   */
  private async buildExercise(exerciseSession: ExerciseSessionEntity): Promise<SessionEntity> {
    const { envid, variables } = await this.sandboxService.build(exerciseSession.source!)

    exerciseSession.envid = envid
    exerciseSession.isBuilt = true
    exerciseSession.variables = variables as ExerciseVariables

    await this.sessionService.update(exerciseSession.id, {
      envid: envid || undefined,
      variables,
      isBuilt: true,
    })

    return exerciseSession
  }

  private async buildNext(activitySession: ActivitySessionEntity): Promise<SessionEntity> {
    const sources = activitySession.source
    const sessions = await this.sessionService.findAllWithParent(activitySession.id)
    sources.variables.exercisesMeta = {}
    for (const exercise of activitySession.variables.navigation.exercises) {
      const meta = sessions.find((s) => s.id === exercise.sessionId)?.variables['.meta']
      if (meta) {
        sources.variables.exercisesMeta[exercise.id] = meta
      } else {
        sources.variables.exercisesMeta[exercise.id] = {
          isInitialBuild: true,
          grades: [],
          attempts: 0,
          totalAttempts: 0,
          consumedHints: 0,
        }
      }
    }
    sources.variables.navigation = activitySession.variables.navigation
    const { envid, variables } = await this.sandboxService.buildNext(sources)

    activitySession.envid = envid
    activitySession.variables = {
      ...activitySession.variables,
      nextExerciseId: variables.nextExerciseId,
      navigation: variables.navigation,
    }

    console.log('souivant :', activitySession.variables.nextExerciseId)

    await this.sessionService.update(activitySession.id, {
      envid: envid || undefined,
      variables: activitySession.variables,
    })

    return activitySession
  }

  /**
   * Builds the given resource and creates new session.
   * @param args Build args.
   * @returns An player instance for the created session.
   */
  private async createNewSession(args: CreateSessionArgs, entityManager?: EntityManager): Promise<SessionEntity> {
    const runWithEntityManager = async (manager: EntityManager): Promise<SessionEntity> => {
      const { user, source, parentId, activity, isBuilt } = args

      source.variables.seed = (Number.parseInt(source.variables.seed + '') || randomInt(100)) % 100

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
          if (!item.source.variables.seed) {
            item.source.variables.seed = variables?.settings?.seedPerExercise ? randomInt(100) : variables.seed
          }
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
            title: await this.resourceFileService.getTitle(item.resource),
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
