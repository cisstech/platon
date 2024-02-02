/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenResponse, User } from '@platon/core/common'
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
  PlayActivityOuput,
  PlayerActions,
  PlayerActivityVariables,
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
    NEXT_EXERCISE: this.nextExercise.bind(this),
    SHOW_SOLUTION: this.showSolution.bind(this),
    REROLL_EXERCISE: this.reroll.bind(this),
  }

  constructor(private readonly sandboxManager: SandboxManager) {}

  async terminate(sessionId: string, user?: User): Promise<PlayActivityOuput> {
    const session = withSessionAccessGuard(await this.findSessionById(sessionId), user)

    const activitySession = session.parent || session
    const activityVariables = activitySession.variables
    if (activityVariables.navigation.terminated) {
      return { activity: withActivityPlayer(activitySession) }
    }

    activityVariables.navigation.terminated = true
    activitySession.variables = activityVariables
    await this.updateSession(activitySession.id, {
      variables: activitySession.variables,
    })

    if (activitySession.activity) {
      this.onTerminate?.(activitySession.activity)
    }

    return {
      activity: withActivityPlayer(activitySession),
    }
  }

  async evaluate(input: EvalExerciseInput, user?: User): Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]> {
    const session = withSessionAccessGuard(await this.findExerciseSessionById(input.sessionId), user)

    const grades = await this.findGrades(session.id)

    withAnswersInSession(session.variables, input.answers || {})
    patchExerciseMeta(session.variables, () => ({ grades, totalAttempts: session.attempts }))
    return this.actionHandlers[input.action](session, user)
  }

  async reroll(exerciseSession: ExerciseSession): Promise<ExercisePlayer> {
    const envid = exerciseSession.envid
    const { source } = exerciseSession

    let variables = source.variables ?? exerciseSession.variables
    variables.seed = Date.now() % 100

    if (variables.builder?.trim()) {
      patchExerciseMeta(variables, () => ({ isInitialBuild: false }))
      const output = await this.sandboxManager.run(
        {
          envid,
          variables,
          files: exerciseSession.source.dependencies.map((file) => ({
            path: file.alias || basename(file.abspath),
            content: file.content,
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
          })),
        },
        variables.hint.next
      )
      patchExerciseMeta(output.variables, (meta) => ({ consumedHints: meta.consumedHints + 1 }))
      variables = output.variables as ExerciseVariables
    }

    await this.updateSession(exerciseSession.id, {
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

    const output = await this.sandboxManager.run(
      {
        envid,
        variables,
        files: exerciseSession.source.dependencies.map((file) => ({
          path: file.alias || basename(file.abspath),
          content: file.content,
        })),
      },
      variables.grader
    )
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

    const answer = await this.createAnswer({
      grade,
      userId: exerciseSession.userId,
      sessionId: exerciseSession.id,
      variables: exerciseSession.variables,
    })

    const promises: Promise<unknown>[] = [
      this.updateSession(exerciseSession.id, {
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

      const childs = await this.findSessionsByParentId(activitySession.id)
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
        this.updateSession(activitySession.id, {
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

  protected abstract createAnswer(answer: Partial<Answer>): Promise<Answer>
  protected abstract updateSession(sessionId: string, changes: PartialDeep<Session>): Promise<void>

  protected abstract findGrades(sessionId: string): Promise<number[]>
  protected abstract findSessionById(sessionId: string): Promise<Session | null | undefined>
  protected abstract findSessionsByParentId(parentId: string): Promise<Session[]>
  protected abstract findExerciseSessionById(id: string): Promise<ExerciseSession | null | undefined>

  protected onTerminate(_activity: Activity): void {
    // Do nothing
  }
}
