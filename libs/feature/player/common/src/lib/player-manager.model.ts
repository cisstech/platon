import { ForbiddenResponse, User, UserRoles } from '@platon/core/common'
import { ActivityVariables, ExerciseVariables, patchExerciseMeta } from '@platon/feature/compiler'
import { Activity } from '@platon/feature/course/common'
import { Answer, ExerciseSession, Session, answerStateFromGrade } from '@platon/feature/result/common'
import { PartialDeep } from 'type-fest'
import { withAnswersInSession } from './player-answer.model'
import { withActivityFeedbacksGuard, withMultiSessionGuard, withSessionAccessGuard } from './player-guards.model'
import { withActivityPlayer, withExercisePlayer } from './player-renderer.model'
import {
  EvalExerciseInput,
  ExercisePlayer,
  hasError,
  PlayActivityOuput,
  PlayerActions,
  PlayerActivityVariables,
  PlayerExercise,
  PlayerNavigation,
} from './player.model'
import { SandboxManager } from './sandbox-manager.model'
import { basename } from '@platon/core/common'

type ActionHandler = (
  session: ExerciseSession,
  user?: User
) => Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]>

export abstract class PlayerManager {
  private readonly actionHandlers: Record<PlayerActions, ActionHandler> = {
    NEXT_HINT: this.nextHint.bind(this),
    CHECK_ANSWER: this.checkAnswer.bind(this),
    SHOW_SOLUTION: this.showSolution.bind(this),
    REROLL_EXERCISE: this.reroll.bind(this),
    SAVE_ANSWER: this.saveTempAnswer.bind(this),
  }

  constructor(private readonly sandboxManager: SandboxManager) {}

  async terminate(sessionId: string, user?: User): Promise<PlayActivityOuput> {
    let session: Session
    if (user?.role === UserRoles.teacher || user?.role === UserRoles.admin) {
      const foundSession = await this.findSessionById(sessionId)
      if (!foundSession) {
        throw new ForbiddenResponse(`Session with id ${sessionId} not found.`)
      }
      session = foundSession
    } else {
      session = withSessionAccessGuard(await this.findSessionById(sessionId), user)
    }

    const activitySession = session.parent || session
    const activityVariables = activitySession.variables
    if (activityVariables.navigation.terminated) {
      return { activity: withActivityPlayer(activitySession) }
    }

    activityVariables.navigation.terminated = true
    activitySession.variables = activityVariables
    await this.updateSession(activitySession.id, {
      variables: activitySession.variables,
      terminatedAt: new Date(),
    })

    if (activitySession.activity) {
      this.onTerminate?.(activitySession.activity)
    }

    if (user?.role === UserRoles.teacher || user?.role === UserRoles.admin) {
      if (session.userId) {
        await this.notifyModerationActivityChanges(session.userId, {
          activity: withActivityPlayer(activitySession),
        })
      }
    }

    return {
      activity: withActivityPlayer(activitySession),
    }
  }

  async openSession(sessionId: string): Promise<PlayActivityOuput> {
    const session = await this.findSessionById(sessionId)
    if (!session) {
      throw new ForbiddenResponse(`Session with id ${sessionId} not found.`)
    }
    const activitySession = session.parent || session
    const activityVariables = activitySession.variables

    if (this.isExpired(activitySession)) {
      throw new ForbiddenResponse(`This session is expired.`)
    }

    if (!activityVariables.navigation.terminated) {
      return { activity: withActivityPlayer(activitySession) }
    }
    activityVariables.navigation.terminated = false
    activitySession.variables = activityVariables
    await this.updateSession(activitySession.id, {
      variables: activitySession.variables,
      terminatedAt: null,
    })

    const result = {
      activity: withActivityPlayer(activitySession),
    }

    if (!session.userId) return result
    await this.notifyModerationActivityChanges(session.userId, result)
    return result
  }

  async openSessionWithCode(sessionId: string, code: string): Promise<PlayActivityOuput> {
    const session = await this.findSessionById(sessionId)
    if (!session) {
      throw new ForbiddenResponse(`Session with id ${sessionId} not found.`)
    }
    if (code !== session.activity?.code) {
      throw new ForbiddenResponse(`Invalid activity code.`)
    }
    const activitySession = session.parent || session
    const activityVariables = activitySession.variables

    if (this.isExpired(activitySession)) {
      throw new ForbiddenResponse(`This session is expired.`)
    }

    if (!activityVariables.navigation.terminated) {
      return { activity: withActivityPlayer(activitySession) }
    }
    activityVariables.navigation.terminated = false
    activitySession.variables = activityVariables
    await this.updateSession(activitySession.id, {
      variables: activitySession.variables,
      terminatedAt: null,
    })

    const result = {
      activity: withActivityPlayer(activitySession),
    }

    if (!session.userId) return result
    await this.notifyModerationActivityChanges(session.userId, result)
    return result
  }

  async evaluate(input: EvalExerciseInput, user?: User): Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]> {
    const session = withSessionAccessGuard(await this.findExerciseSessionById(input.sessionId), user)
    if (this.isExpired(session)) {
      throw new ForbiddenResponse(`This session is expired.`)
    }

    const grades = await this.findGrades(session.id)

    withAnswersInSession(session.variables, input.answers || {})
    patchExerciseMeta(session.variables, () => ({ grades, totalAttempts: session.attempts }))
    return this.actionHandlers[input.action](session, user)
  }

  async saveTemporaryAnswer(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]> {
    const session = withSessionAccessGuard(await this.findExerciseSessionById(input.sessionId), user)
    if (this.isExpired(session)) {
      throw new ForbiddenResponse(`This session is expired.`)
    }

    const answers = input.answers || {}

    session.variables['answers'] = {
      ...session.variables['answers'],
      ...answers,
    }

    withAnswersInSession(session.variables, answers)

    await this.updateSession(session.id, {
      variables: session.variables,
    })

    return this.actionHandlers[input.action](session, user)
  }

  private async saveTempAnswer(session: ExerciseSession): Promise<ExercisePlayer> {
    return withExercisePlayer(session)
  }

  async reroll(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    const envid = exerciseSession.envid
    const { source } = exerciseSession

    let variables = source.variables ?? exerciseSession.variables
    variables.seed = Date.now() % 100

    if (variables.builder?.trim()) {
      const grades = await this.findGrades(exerciseSession.id)

      patchExerciseMeta(variables, () => ({ grades, isInitialBuild: false }))
      variables['.meta']['totalAttempts'] = exerciseSession.variables['.meta']['totalAttempts']
      const output = await this.sandboxManager.run(
        {
          envid,
          variables,
          files: exerciseSession.source.dependencies.map((file) => ({
            path: file.alias || basename(file.abspath),
            content: file.content,
            hash: file.hash,
          })),
        },
        variables.builder
      )
      variables = output.variables as ExerciseVariables
    }

    await this.updateSession(exerciseSession.id, {
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
      const output = await this.sandboxManager.run(
        {
          envid,
          variables,
          files: exerciseSession.source.dependencies.map((file) => ({
            path: file.alias || basename(file.abspath),
            content: file.content,
            hash: file.hash,
          })),
        },
        variables.hint.next
      )
      patchExerciseMeta(output.variables as ExerciseVariables, (meta) => ({ consumedHints: meta.consumedHints + 1 }))
      variables = output.variables as ExerciseVariables
    }

    await this.updateSession(exerciseSession.id, {
      variables: (exerciseSession.variables = variables),
    })

    return withExercisePlayer(exerciseSession)
  }

  async checkAnswer(exerciseSession: ExerciseSession): Promise<[ExercisePlayer, PlayerNavigation]> {
    const { activitySession, activityNavigation } = withMultiSessionGuard(exerciseSession)
    let challengeSucceded = false
    // EVAL ANSWERS

    const envid = exerciseSession.envid
    let variables = exerciseSession.variables
    variables.feedback = { type: 'info', content: '' }

    const submissionFiles = await Promise.all(
      exerciseSession?.submissions?.map(async (file) => ({
        path: 'submission/' + basename(file.fileName),
        content: await file.getContent(),
        hash: '',
      })) || []
    )

    const output = await this.sandboxManager.run(
      {
        envid,
        variables,
        files: exerciseSession.source.dependencies.map((file) => ({
          path: file.alias || basename(file.abspath),
          content: file.content,
          hash: file.hash,
        })),
        submissionFiles: submissionFiles,
      },
      variables.grader
    )

    exerciseSession.envid = output.envid

    let grade = Number.parseInt(output.variables['grade']) ?? -1
    if (Number.isNaN(grade)) {
      grade = -1
    }

    const increment = grade > -1 ? 1 : 0

    variables = output.variables as ExerciseVariables

    patchExerciseMeta(variables, (meta) => ({
      attempts: meta.attempts + increment,
      error: hasError(variables),
    }))

    exerciseSession.grade = Math.max(grade, exerciseSession.grade ?? -1)
    exerciseSession.attempts += increment
    exerciseSession.variables = variables

    // SAVE ANSWER WITH GRADE

    const answer = await this.createAnswer({
      grade,
      userId: exerciseSession.userId,
      sessionId: exerciseSession.id,
      variables: exerciseSession.variables,
    })

    // NOTIFY EXERCISE CHANGES TO MONITORING USERS
    if (exerciseSession.userId) {
      // Créer un PlayerExercise à partir de l'exerciseSession
      const playerExercise: PlayerExercise = {
        id: exerciseSession.id,
        title: exerciseSession.source.variables.title as string,
        state: answerStateFromGrade(answer.grade),
        sessionId: exerciseSession.id,
      }
      await this.notifyExerciseChanges(exerciseSession.userId, exerciseSession.id, playerExercise)
    }

    if (answer.grade === 100 && !exerciseSession.succeededAt) {
      exerciseSession.succeededAt = new Date()
    }

    const grades = [...variables['.meta']['grades'], grade]
    patchExerciseMeta(variables, () => ({ grades, isInitialBuild: false }))

    // alert potential monitoringUsers

    const promises: Promise<unknown>[] = [
      this.updateSession(exerciseSession.id, {
        envid: exerciseSession.envid,
        grade: exerciseSession.grade,
        attempts: exerciseSession.attempts,
        variables: exerciseSession.variables,
        lastGradedAt: new Date(),
        succeededAt: exerciseSession.succeededAt,
      }),
    ]

    // UPDATE NAVIGATION ACCORDING TO GRADE
    let exoPlayer: ExercisePlayer | undefined
    if (activitySession && activityNavigation) {
      const current = activityNavigation.exercises.find((item) => item.sessionId === exerciseSession.id)
      if (current) {
        current.state = answerStateFromGrade(answer.grade)
        current.grade = answer.grade
        activityNavigation.exercises = activityNavigation.exercises.map((item) =>
          item.sessionId === current.sessionId ? current : item
        )
        activityNavigation.current = current
      }

      const childs = await this.findSessionsByParentId(activitySession.id)
      activitySession.grade = exerciseSession.grade
      childs.forEach((child) => {
        if (child.id === exerciseSession.id) return
        if (typeof child.grade === 'number' && child.grade !== -1) {
          activitySession.grade += child.grade
        }
      })

      if (activitySession.grade && activitySession.grade > 0 && childs.length) {
        activitySession.grade = Number((activitySession.grade / childs.length).toFixed(2))
      }

      if (activitySession.grade === 100 && !activitySession.succeededAt) {
        activitySession.succeededAt = new Date()
        if (activitySession.activity) {
          challengeSucceded = true
        }
      }

      activitySession.attempts += increment

      let peerActivityNavigation: PlayerNavigation | undefined
      if (activitySession?.variables.settings?.navigation?.mode === 'peer') {
        const playerAndNavigation = await this.nextPeerExercise(exerciseSession, activityNavigation, answer)
        exoPlayer = playerAndNavigation[0]
        peerActivityNavigation = playerAndNavigation[1]
      }

      if (activitySession?.variables.settings?.navigation?.mode === 'peer') {
        promises.push(
          this.updateSession(activitySession.id, {
            grade: activitySession.grade,
            attempts: activitySession.attempts,
            succeededAt: activitySession.succeededAt,
            variables: {
              ...activitySession.variables,
              navigation: {
                ...(peerActivityNavigation ?? activityNavigation),
                current: exoPlayer,
              },
            } as PlayerActivityVariables,
            lastGradedAt: new Date(),
          })
        )
      } else {
        promises.push(
          this.updateSession(activitySession.id, {
            grade: activitySession.grade,
            attempts: activitySession.attempts,
            succeededAt: activitySession.succeededAt,
            variables: {
              ...activitySession.variables,
              navigation: activityNavigation,
            } as PlayerActivityVariables,
            lastGradedAt: new Date(),
          })
        )
      }
    }

    await Promise.all(promises)
    if (challengeSucceded && activitySession?.activity) {
      this.onChallengeSucceeded(activitySession.activity)
    }
    return [
      exoPlayer ?? withExercisePlayer(exerciseSession),
      activitySession
        ? withActivityFeedbacksGuard<ActivityVariables>(activitySession).variables['navigation']
        : undefined,
    ]
  }

  async nextExercise(exerciseSession: ExerciseSession): Promise<[ExercisePlayer, PlayerNavigation]> {
    const activitySession = exerciseSession.parent
    if (!activitySession) {
      throw new ForbiddenResponse(`This action can be called only with dynamic activities.`)
    }

    activitySession.activity = activitySession.activity ?? exerciseSession.activity

    return [withExercisePlayer(exerciseSession), activitySession.variables['navigation']]
  }

  async showSolution(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    patchExerciseMeta(exerciseSession.variables, () => ({ showSolution: true }))
    await this.updateSession(exerciseSession.id, {
      variables: exerciseSession.variables,
    })
    return withExercisePlayer(exerciseSession)
  }

  private isExpired(session: Session): boolean {
    const settingsHolder = session.parent ?? session
    const duration = settingsHolder.variables.settings?.duration
    const now = new Date()

    if (settingsHolder.startedAt && duration) {
      const durationExpiresAt = new Date(settingsHolder.startedAt)
      durationExpiresAt.setSeconds(durationExpiresAt.getSeconds() + duration + 30)
      if (now > durationExpiresAt) {
        return true
      }
    }

    if (session.activity?.closeAt) {
      const closeAtExpiresAt = new Date(session.activity.closeAt)
      closeAtExpiresAt.setSeconds(closeAtExpiresAt.getSeconds() + 30)
      if (now > closeAtExpiresAt) {
        return true
      }
    }

    return false
  }

  protected abstract createAnswer(answer: Partial<Answer>): Promise<Answer>
  protected abstract updateSession(sessionId: string, changes: PartialDeep<Session>): Promise<void>
  protected abstract notifyExerciseChanges(userId: string, sessionId: string, exercise: PlayerExercise): Promise<void>
  protected abstract notifyModerationActivityChanges(userId: string, activityChange: PlayActivityOuput): Promise<void>

  protected abstract findGrades(sessionId: string): Promise<number[]>
  protected abstract findSessionById(sessionId: string): Promise<Session | null | undefined>
  protected abstract findSessionsByParentId(parentId: string): Promise<Session[]>
  protected abstract findExerciseSessionById(id: string): Promise<ExerciseSession | null | undefined>
  protected abstract nextPeerExercise(
    exerciseSession: ExerciseSession,
    navigation: PlayerNavigation | undefined,
    answer: Answer
  ): Promise<[ExercisePlayer, PlayerNavigation]> // Probably not handled if not on server side
  protected onChallengeSucceeded(_activity: Activity): void {
    // Do nothing
  }
  protected onTerminate(_activity: Activity): void {
    // Do nothing
  }
}
