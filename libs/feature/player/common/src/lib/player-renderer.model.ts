/* eslint-disable @typescript-eslint/no-explicit-any */
import { deepCopy, deepMerge } from '@platon/core/common'
import {
  ActivitySettings,
  ExerciseVariables,
  defaultActivitySettings,
  withExerciseMeta,
} from '@platon/feature/compiler'
import { ActivitySession, Answer, ExerciseSession } from '@platon/feature/result/common'
import * as nunjucks from 'nunjucks'
import { v4 as uuidv4 } from 'uuid'
import {
  withActivityFeedbacksGuard,
  withFeedbacksGuard,
  withHintGuard,
  withSolutionGuard,
  withTheoriesGuard,
} from './player-guards.model'
import { ActivityPlayer, ExercisePlayer } from './player.model'
import { calculateActivityOpenState } from '@platon/feature/course/common'

type Scripts = Record<string, string>

nunjucks.configure({ autoescape: false })

/**
 * Transforms recursivly all Editor.js content to HTML code from `object`.
 * @param variables Object to transform.
 * @param scripts A list of scripts to fill.
 * @returns A computed version of the object.
 */
const withEditorJsContent = (variables: any, scripts: Scripts): any => {
  if (variables == null) {
    return variables
  }

  if (Array.isArray(variables)) {
    return variables.map((v) => withEditorJsContent(v, scripts))
  }

  if (typeof variables === 'object') {
    return Object.keys(variables).reduce((o, k) => {
      o[k] = withEditorJsContent(variables[k], scripts)
      return o
    }, {} as any)
  }

  if (typeof variables === 'string') {
    const editorJsOutputRegex = /^\s*\{[\s\S]*"blocks"\s*:\s*\[[\s\S]*\][\s\S]*\}\s*$/
    const isEditorJsOutput = editorJsOutputRegex.test(variables)
    if (isEditorJsOutput) {
      const id = uuidv4()
      scripts[id] = variables
      return `<wc-editorjs-viewer id='${id}'></wc-editorjs-viewer>`
    }
  }

  return variables
}

/**
 * Transforms recursivly all component objects to HTML code from `object`.
 * A component is an object with both `cid` and `selector` properties.
 * @param variables Object to transform.
 * @param scripts A list of scripts to fill.
 * @param reviewMode If true, the components will be disabled.
 * @returns A computed version of the object.
 */
export const withRenderedComponents = (variables: any, scripts: Scripts, reviewMode?: boolean): any => {
  if (variables == null) {
    return variables
  }
  if (Array.isArray(variables)) {
    return variables.map((v) => withRenderedComponents(v, scripts, reviewMode))
  }

  if (typeof variables === 'object') {
    if (variables.cid && variables.selector) {
      if (reviewMode) {
        variables.disabled = true
      }
      const { cid, selector } = variables
      const scriptId = uuidv4()
      scripts[scriptId] = JSON.stringify(variables)
      return `<${selector} data-script-id='${scriptId}' cid='${cid}'></${selector}><script type='application/json' id='${scriptId}'>${JSON.stringify(
        variables
      )}</script>`.trim()
    }
    return Object.keys(variables).reduce((o, k) => {
      o[k] = withRenderedComponents(variables[k], scripts, reviewMode)
      return o
    }, {} as any)
  }

  return variables
}

/**
 * Renders all keys of `variables` which are consired as nunjucks templates.
 * @param variables A list of variables.
 * @param reviewMode If true, the components will be disabled.
 * @returns The variables with rendered templates.
 */
export const withRenderedTemplates = (variables: ExerciseVariables, reviewMode?: boolean): ExerciseVariables => {
  withExerciseMeta(variables)

  variables.meta = variables['.meta']

  const scripts: Scripts = {}

  const computed = withEditorJsContent(
    withRenderedComponents(variables, scripts, reviewMode),
    scripts
  ) as ExerciseVariables

  const templates = ['statement', 'form', 'solution', 'feedback', 'hint']

  const render = (v: any): any => {
    if (typeof v === 'string') {
      return nunjucks.renderString(v, computed).trim()
    }
    if (Array.isArray(v)) {
      return v.map(render)
    }
    if (typeof v === 'object') {
      return Object.keys(v).reduce((o, k) => {
        o[k] = render((v as any)[k])
        return o
      }, {} as any)
    }
    return v
  }

  for (const k in computed) {
    if (templates.includes(k)) {
      computed[k] = render(computed[k])
    }
  }

  Object.keys(scripts).forEach((k) => {
    scripts[k] = nunjucks.renderString(scripts[k], computed)
  })

  delete computed.meta

  return computed
}

/**
 * Creates new player for an activity session.
 * @param session An activity session.
 * @returns An activity player.
 */
export const withActivityPlayer = (session: ActivitySession): ActivityPlayer => {
  const { variables } = withActivityFeedbacksGuard(session)
  const openState = calculateActivityOpenState({ openAt: session.activity?.openAt, closeAt: session.activity?.closeAt })

  return {
    type: 'activity',
    sessionId: session.id,
    activityId: session.activityId,
    title: variables.title,
    author: variables.author,
    startedAt: session.startedAt,
    openAt: session.activity?.openAt,
    closeAt: session.activity?.closeAt,
    state: openState,
    serverTime: new Date(),
    lastGradedAt: session.lastGradedAt,
    introduction: variables.introduction,
    conclusion: variables.conclusion,
    settings: variables.settings,
    navigation: variables.navigation,
  }
}

/**
 * Creates new player for an exercise session.
 * @param session An exercise session.
 * @returns An exercise player.
 */
export const withExercisePlayer = (session: ExerciseSession, answer?: Answer): ExercisePlayer => {
  const variables = withRenderedTemplates(answer?.variables || session.variables, answer != null)

  const activitySession = session.parent

  const activitySettings = (
    activitySession ? deepCopy(activitySession.variables.settings || {}) : defaultActivitySettings()
  ) as ActivitySettings

  const hint = withHintGuard(variables, activitySettings, answer)
  const solution = withSolutionGuard(variables, activitySettings, answer)
  const theories = withTheoriesGuard(variables, activitySettings, answer)
  const feedbacks = withFeedbacksGuard(variables, activitySettings, answer)

  // REROLL
  if (answer) {
    deepMerge(activitySettings, { actions: { reroll: false } })
  }

  // ATTEMPTS
  let remainingAttempts: number | undefined
  const { actions } = activitySettings
  if (actions?.retry && actions.retry > 0) {
    remainingAttempts = actions.retry - (variables['.meta']?.attempts || 0)
  }

  return {
    type: 'exercise',
    settings: activitySettings,
    solution,
    feedbacks,
    theories,
    hints: !hint
      ? undefined
      : Array.isArray(hint)
      ? variables['.meta']?.consumedHints
        ? hint.slice(0, variables['.meta'].consumedHints)
        : []
      : hint.data,
    remainingAttempts,
    answerId: answer?.id,
    sessionId: session.id,
    author: variables.author,
    title: variables.title,
    form: variables.form,
    statement: variables.statement,
    startedAt: session.startedAt,
    lastGradedAt: session.lastGradedAt,
    platon_logs: variables.platon_logs, // Special logs for Platon
    correction: session?.correction
      ? {
          grade: session.correction.grade,
          authorId: session.correction.authorId,
          createdAt: session.correction.createdAt,
          updatedAt: session.correction.updatedAt,
        }
      : undefined,
  }
}
