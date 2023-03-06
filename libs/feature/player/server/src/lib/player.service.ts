/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { deepCopy, deepMerge, NotFoundResponse, UnauthorizedResponse, User } from '@platon/core/common';
import { PLSourceFile } from '@platon/feature/compiler';
import { CourseService } from '@platon/feature/course/server';
import { ActivityExercise, ActivityPlayer, ActivityVariables, answerStateFromGrade, AnswerStates, defaultPlayerSettings, EvalExerciseInput, ExerciseFeedback, ExerciseHint, ExercisePlayer, ExerciseTheory, ExerciseVariables, PlayActivityOuput, PlayerActions, PlayerNavigation, PlayerPage, PlayerSettings, PlayExerciseOuput, PreviewInput, Variables } from '@platon/feature/player/common';
import { ResourceFileService } from '@platon/feature/resource/server';
import * as nunjucks from 'nunjucks';
import { DataSource, EntityManager } from 'typeorm';
import { PlayerAnswerService } from './answers/answer.service';
import { PreviewOuputDTO } from './player.dto';
import { SandboxService } from './sandboxes/sandbox.service';
import { PlayerSessionEntity } from './sessions/session.entity';
import { PlayerSessionService } from './sessions/session.service';

nunjucks.configure({ autoescape: false });

@Injectable()
export class PlayerService {
  private readonly actionHandlers: Record<PlayerActions, ActionHandler> = {
    NEXT_HINT: this.nextHint.bind(this),
    CHECK_ANSWER: this.checkAnswer.bind(this),
    NEXT_EXERCISE: this.nextExercise.bind(this),
    SHOW_SOLUTION: this.showSolution.bind(this),
    REROLL_EXERCISE: this.reroll.bind(this),
  }

  constructor(
    private readonly dataSource: DataSource,
    private readonly courseService: CourseService,
    private readonly fileService: ResourceFileService,
    private readonly sandboxService: SandboxService,
    private readonly answerService: PlayerAnswerService,
    private readonly sessionService: PlayerSessionService,
  ) { }

  // ENDPOINTS

  /**
   * Creates new player session for the given resource for preview purpose.
   *
   * Note :
   *
   * The created session will not be linked to any user.
   * @param input Informations about the resource to preview.
   * @returns A player layout for the resource.
   */
  async preview(
    input: PreviewInput
  ): Promise<PreviewOuputDTO> {
    const [source, resource] = await this.fileService.compile(
      input.resource,
      input.version,
    );
    const session = await this.createNewSession({ source });
    return {
      exercise: resource.type === 'EXERCISE' ? this.withExercisePlayer(session) : undefined,
      activity: resource.type === 'ACTIVITY' ? this.withActivityPlayer(session) : undefined,
    }
  }

  async playActivity(
    courseActivityId: string,
    user: User
  ): Promise<PlayActivityOuput> {
    const activitySession = await this.sessionService.ofCourseActivity(
      courseActivityId,
      user.id
    );

    if (activitySession) {
      await this.sessionService.update(activitySession.id, {
        startedAt: activitySession.startedAt || new Date(),
      });
      return {
        activity: this.withActivityPlayer(activitySession),
      }
    }

    const courseActivity = await this.courseService.findCourseActivityById(courseActivityId);
    if (!courseActivity) {
      throw new NotFoundResponse(`CourseActivity not found: ${courseActivityId}.`);
    }

    if (!await this.courseService.canViewActivity(user, courseActivity)) {
      throw new UnauthorizedResponse(`User do not belong to the activity ${courseActivity}.`)
    }

    const session = await this.createNewSession({
      user,
      source: courseActivity.source,
      courseActivityId: courseActivity.id,
    });

    return {
      activity: this.withActivityPlayer(session)
    }
  }

  async playExercises(
    activitySessionId: string,
    exerciseSessionIds: string[],
    user?: User
  ): Promise<PlayExerciseOuput> {
    const activitySession = await this.sessionService.findById(activitySessionId);
    if (!activitySession) {
      throw new NotFoundResponse(`ActivitySession not found: ${activitySessionId}`);
    }

    const activityVariables = (activitySession.variables as ActivityVariables);
    if (activityVariables.navigation.terminated) {
      throw new UnauthorizedResponse(`ActivitySession already terminated: ${activitySessionId}`);
    }

    // CREATE PLAYERS
    const exercises = await Promise.all(
      exerciseSessionIds.map(async (sessionId) => {
        const exerciseSession = this.withSessionAccessGuard(
          await this.sessionService.ofExercise(activitySessionId, sessionId, undefined),
          user
        );
        await this.sessionService.update(exerciseSession.id, {
          startedAt: exerciseSession.startedAt || new Date()
        });
        return this.withExercisePlayer(exerciseSession);
      })
    );

    // UPDATE NAVIGATION
    activityVariables.navigation.started = true;
    if ('manual' === activityVariables.settings?.navigation?.mode) {
      activityVariables.navigation.current = activityVariables.navigation.exercises.find(item => {
        if (item.sessionId === exerciseSessionIds[0]) {
          if (item.state === AnswerStates.NOT_STARTED) {
            item.state = AnswerStates.STARTED;
          }
          return true;
        }
        return false;
      }) as PlayerPage;
    } else if ('composed' === activityVariables.settings?.navigation?.mode) {
      activityVariables.navigation.exercises.forEach(item => {
        if (item.state === AnswerStates.NOT_STARTED) {
          item.state = AnswerStates.STARTED;
        }
      });
    }

    // SAVE ACTIVITY SESSION
    await this.sessionService.update(activitySessionId, {
      variables: activityVariables,
      startedAt: activitySession.startedAt ?? new Date(),
    });

    return {
      exercises,
      navigation: activityVariables.navigation,
    }
  }

  async terminateSession(
    sessionId: string,
    user?: User
  ): Promise<PlayActivityOuput> {
    const session = this.withSessionAccessGuard(
      await this.sessionService.findById(sessionId),
      user
    );

    const activitySession = session.parent || session;
    const activityVariables = activitySession.variables as ActivityVariables;
    activityVariables.navigation.terminated = true;
    await this.sessionService.update(activitySession.id, {
      variables: activityVariables
    });

    return {
      activity: this.withActivityPlayer(activitySession)
    }
  }

  // EVAL


  async evaluate(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]> {
    return this.actionHandlers[input.action](input, user);
  }

  async reroll(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = this.withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId),
      user
    );

    const envid = exerciseSession.envid;
    const variables = exerciseSession.variables as ExerciseVariables;

    variables['.meta'] = undefined;
    variables.feedback = undefined;

    if (variables.builder) {
      const response = await this.sandboxService.run({ envid, variables }, variables.builder);
      exerciseSession.variables = response.variables;
    }

    await this.sessionService.update(exerciseSession.id, {
      variables: exerciseSession.variables
    });

    return this.withExercisePlayer(exerciseSession);
  }

  async nextHint(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = this.withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId),
      user
    );

    const envid = exerciseSession.envid;
    let variables = exerciseSession.variables as ExerciseVariables;

    if (Array.isArray(variables.hint)) {
      variables['.meta'] = {
        ...(variables['.meta'] || {}),
        consumedHints: (variables['.meta']?.consumedHints || 0) + 1
      }
    } else if (variables.hint?.next) {
      const response = await this.sandboxService.run({ envid, variables }, variables.hint.next);
      variables = response.variables as ExerciseVariables;
    }

    exerciseSession.variables = variables;

    await this.sessionService.update(exerciseSession.id, { variables: variables });

    return this.withExercisePlayer(exerciseSession);
  }

  async checkAnswer(
    input: EvalExerciseInput,
    user?: User
  ): Promise<[ExercisePlayer, PlayerNavigation]> {
    const exerciseSession = this.withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId),
      user
    );

    const { activitySession, activityNavigation } = this.withMultiSessionGuard(exerciseSession);

    // EVAL ANSWERS

    this.withAnswersInSession(exerciseSession, input.answers || {});

    const envid = exerciseSession.envid;
    let variables = exerciseSession.variables as ExerciseVariables;

    const output = await this.sandboxService.run({ envid, variables }, variables.grader);

    variables = output.variables as ExerciseVariables;

    variables['.meta'] = {
      ...(variables['.meta'] || {}),
      attempts: (variables['.meta']?.attempts || 0) + 1,
    };

    exerciseSession.variables = variables

    // SAVE ANSWER WITH GRADE

    const answer = await this.answerService.create({
      sessionId: exerciseSession.id,
      variables: exerciseSession.variables,
      grade: Number.parseInt(exerciseSession.variables.grade) ?? -1,
    });

    const promises: Promise<unknown>[] = [
      this.sessionService.update(exerciseSession.id, { variables: exerciseSession.variables })
    ];

    // UPDATE NAVIGATION ACCORDING TO GRADE

    if (activitySession && activityNavigation) {
      const current = activityNavigation.exercises.find(item => item.sessionId === exerciseSession.id);
      if (current) {
        current.state = answerStateFromGrade(answer.grade);
        activityNavigation.exercises = activityNavigation.exercises.map(item => (
          item.sessionId === current.sessionId ? current : item
        ));
        promises.push(
          this.sessionService.update(activitySession.id, {
            variables: {
              ...activitySession.variables,
              navigation: activityNavigation
            } as ActivityVariables
          })
        );
      }
    }

    await Promise.all(promises);

    return [
      this.withExercisePlayer(exerciseSession),
      activityNavigation as PlayerNavigation
    ]
  }

  async nextExercise(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = this.withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId),
      user
    );

    const activitySession = exerciseSession.parent;
    if (!activitySession) {
      throw new UnauthorizedResponse(`This action can be called only with dynamic activities.`)
    }

    this.withAnswersInSession(exerciseSession, input.answers || {});

    // TODO define the api for dynamic activities

    return this.withExercisePlayer(exerciseSession);
  }

  async showSolution(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = this.withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId),
      user
    );

    this.withAnswersInSession(exerciseSession, input.answers || {});

    const variables = exerciseSession.variables as ExerciseVariables;
    variables['.meta'] = {
      ...(variables['.meta'] || {}),
      showSolution: true,
    };

    return this.withExercisePlayer(exerciseSession);
  }

  // BUILD

  /**
   * Builds the given resource and creates new session.
   * @param args Build args.
   * @returns An player instance for the created session.
   */
  private async createNewSession(
    args: CreateSessionArgs,
    entityManager?: EntityManager
  ): Promise<PlayerSessionEntity> {
    const create = async (
      manager: EntityManager
    ): Promise<PlayerSessionEntity> => {
      const {
        user,
        source,
        parentId,
        courseActivityId,
      } = args;

      const { envid, variables } = await this.sandboxService.build(source);

      const session = await this.sessionService.create({
        envid: envid || null as any,
        userId: user?.id || null as any,
        parentId: parentId || null as any,
        courseActivityId: courseActivityId || null as any,
        variables
      }, manager);

      if (source.abspath.endsWith('.pla')) {
        session.variables = await this.withActivityNavigation(
          variables as ActivityVariables, session, user, manager
        );
        await this.sessionService.update(session.id, {
          variables: session.variables
        }, manager);
      }

      return session;
    }

    return entityManager
      ? create(entityManager)
      : this.dataSource.transaction(create)
      ;
  }

  /**
   * Ensures that every a session is created for each exercices of the given activity navigation
   * for `user`.
   * @param variables Activity variables.
   * @returns Computed variables.
   */
  private async withActivityNavigation(
    variables: ActivityVariables,
    activitySession: PlayerSessionEntity,
    user?: User,
    manager?: EntityManager
  ): Promise<ActivityVariables> {
    const navigation = variables.navigation || {};
    navigation.started = navigation.started ?? false;
    navigation.terminated = navigation.terminated ?? false;

    const groups = variables.exerciseGroups || {};
    const exercises = (navigation.exercises || []) as (PlayerPage | ActivityExercise)[]

    if (!exercises.length) {
      Object.keys(groups).forEach(group => {
        (groups[group] || []).forEach(exercise => {
          exercises.push(exercise);
        });
      });
    }

    navigation.exercises = await Promise.all(
      exercises.map(async item => {
        if (!('sessionId' in item)) {
          const session = await this.createNewSession({
            courseActivityId: activitySession.courseActivityId,
            parentId: activitySession.id,
            source: item.source,
            user,
          }, manager);
          return {
            title: item.source.variables.title as string,
            state: AnswerStates.NOT_STARTED,
            sessionId: session.id
          };
        }
        return item;
      })
    );

    return {
      ...variables,
      navigation
    }
  }

  /**
   * Creates new player for an activity session.
   * @param session An activity session.
   * @returns An activity player.
   */
  private withActivityPlayer(
    session: PlayerSessionEntity,
  ): ActivityPlayer {
    const variables = session.variables as ActivityVariables;
    return {
      type: 'activity',
      sessionId: session.id,
      title: variables.title,
      author: variables.author,
      introduction: variables.introduction,
      conclusion: variables.conclusion,
      settings: variables.settings,
      navigation: variables.navigation
    };
  }

  /**
   * Creates new player for an exercise session.
   * @param session An exercise session.
   * @returns An exercise player.
   */
  private withExercisePlayer(
    session: PlayerSessionEntity,
  ): ExercisePlayer {
    const variables = this.withRenderedTemplates(session.variables);

    const settings = (
      session.parent ? deepCopy(session.parent.variables.settings || {}) : defaultPlayerSettings()
    ) as PlayerSettings;

    const hint = this.withHintGuard(variables, settings);
    const solution = this.withSolutionGuard(variables, settings);
    const theories = this.withTheoriesGuard(variables, settings);
    const feedbacks = this.withFeedbacksGuard(variables, settings);

    // ATTEMPTS
    let remainingAttempts: number | undefined;
    if (settings.actions?.retry && settings.actions.retry !== -1) {
      remainingAttempts = settings.actions.retry - (variables['.meta']?.attempts || 0)
    }

    return {
      type: 'exercise',
      settings,
      solution,
      feedbacks,
      theories,
      hints: !hint
        ? undefined
        : Array.isArray(hint)
          ? (variables['.meta']?.consumedHints ? hint.slice(0, variables['.meta'].consumedHints) : [])
          : hint.data,
      remainingAttempts,
      sessionId: session.id,
      author: variables.author,
      title: variables.title,
      form: variables.form,
      statement: variables.statement
    }
  }

  // RENDERING

  /**
   * Transforms recursivly all component objects to HTML code from `object`.
   * A component is an object with both `cid` and `selector` properties.
   * @param variables Object to transform.
   * @returns A computed version of the object.
   */
  private withRenderedComponents(
    variables: any
  ): any {
    if (Array.isArray(variables)) {
      return variables.map(this.withRenderedComponents.bind(this));
    }
    if (typeof variables === 'object') {
      if (variables.cid && variables.selector) {
        return `<${variables.selector} cid='${variables.cid}' state='${JSON.stringify(variables)}' />`
      }
      return Object.keys(variables).reduce((o, k) => {
        o[k] = this.withRenderedComponents(variables[k])
        return o;
      }, {} as any)
    }
    return variables;
  }

  /**
   * Renders all keys of `variables` which are consired as nunjucks templates.
   * @param variables A list of variables.
   * @returns The variables with rendered templates.
   */
  private withRenderedTemplates(
    variables: Variables
  ): ExerciseVariables {

    const computed = this.withRenderedComponents(variables) as ExerciseVariables;

    const templates = ['title', 'statement', 'form', 'solution', 'feedback', 'hints'];

    for (const k in computed) {
      if (templates.includes(k)) {
        if (typeof computed[k] === 'string') {
          computed[k] = nunjucks.renderString(computed[k] as string, computed);
        } else if (Array.isArray(computed[k])) {
          computed[k] = computed[k].map((v: string) => {
            return nunjucks.renderString(v, computed)
          });
        }
      }
    }

    computed['.meta'] = {
      ...(computed['.meta'] || {}),
      attempts: computed['.meta']?.attempts || 0,
    };

    return computed;
  }

  /**
   * Merges user answers with the session variables.
   * @param session Session in which the answers must be merged
   * @param answers Answers to merge in the session.
   * @returns The session computed with the answers.
   */
  private withAnswersInSession(
    session: PlayerSessionEntity,
    answers: Variables
  ): PlayerSessionEntity {
    const components: Variables = {};

    const search = (variables: Variables) => {
      for (const key in variables) {
        const value = variables[key];
        if (typeof value === 'object') {
          if (value.cid && value.selector) {
            components[value.cid] = value;
          } else {
            search(value);
          }
        } else if (Array.isArray(value)) {
          value.forEach(search);
        }
      }
    }

    search(session.variables);

    for (const cid in answers) {
      if (cid in components) {
        Object.assign(components[cid], answers[cid]);
      }
    }

    return session;
  }

  // SESSION GUARDS

  /**
   * Ensures that `user` has access to `session`.
   *
   * Note:
   *
   * Preview sessions are not bound to any user so an `undefined` value for `user` means that the session is a preview.
   *
   * @param session Session to check the user rights for.
   * @param user User for which to check the rights.
   * @returns The session.
   */
  private withSessionAccessGuard(
    session?: PlayerSessionEntity | null,
    user?: User
  ): PlayerSessionEntity {
    if (!session) {
      throw new NotFoundResponse(`PlayerSession not found.`);
    }

    if (session.userId && session.userId !== user?.id) {
      throw new UnauthorizedResponse('You cannot access to this session.');
    }

    return session;
  }

  /**
   * Ensures that user cannot have multiple sessions of the same exercise at the same time (in non composed navigation mode).
   *
   * Note :
   * Exercise preview session are not bound to an activity.
   *
   * @param exerciseSession An exercise session.
   * @returns An object containing the activitySession with it's navigation
   *  or `undefined` if the exercise is not bound to an activity.
   */
  private withMultiSessionGuard(
    exerciseSession: PlayerSessionEntity
  ) {
    let activitySession: PlayerSessionEntity | undefined;
    let activityNavigation: PlayerNavigation | undefined;
    if (exerciseSession.parent) {
      activitySession = exerciseSession.parent as PlayerSessionEntity;
      const activityVariables = activitySession.variables as ActivityVariables;
      activityNavigation = activityVariables.navigation;

      if ('composed' === activityVariables.settings?.navigation?.mode) {
        return { activitySession, activityNavigation };
      }

      if (typeof activityNavigation.current !== 'object' || activityNavigation.current.sessionId !== exerciseSession.id) {
        throw new UnauthorizedResponse('This exercise is not the most recents opened, please reload your page.');
      }
    }
    return { activitySession, activityNavigation };
  }

  // SETTING GUARDS

  /**
   * Ensures that hints are not sent to the user if disabled in `settings` or not already asked by the user.
   * @param variables Exercise variables
   * @param settings Exercise settings.
   * @returns The hints to show to the user if applicable otherwise `undefined`.
   */
  private withHintGuard(
    variables: ExerciseVariables,
    settings: PlayerSettings
  ): ExerciseHint | string[] | undefined {
    let hint = variables.hint;

    if (!hint) {
      // disable hint button if there is not hint
      deepMerge(settings, { actions: { hints: false } });
    } else if (Array.isArray(hint) && hint.length === variables['.meta']?.consumedHints) {
      // disable hint button if all automatic hints are consumed
      deepMerge(settings, { actions: { hints: false } });
    } else if (hint && !Array.isArray(hint) && hint.empty) {
      // disable hint button if hint.empty is set by exercise script
      deepMerge(settings, { actions: { hints: false } });
    } else if (!settings.actions?.hints) { // disable hint if specified in settings
      hint = undefined;
    }

    return hint;
  }

  /**
   * Ensures that theory documents are not sent to the user if disabled in `settings`.
   * @param variables Exercise variables
   * @param settings Exercise settings.
   * @returns The theories to show to the user if applicable otherwise `undefined`.
   */
  private withTheoriesGuard(
    variables: ExerciseVariables,
    settings: PlayerSettings
  ): ExerciseTheory[] | undefined {
    let theories = variables.theories;
    if (!settings.actions?.theories) {
      theories = [];
    }
    return theories;
  }

  /**
   * Ensures that solution is not sent to the user if disabled in `settings` or not already asked by the user.
   * @param variables Exercise variables
   * @param settings Exercise settings.
   * @returns The solution to show to the user if applicable otherwise `undefined`.
   */
  private withSolutionGuard(
    variables: ExerciseVariables,
    settings: PlayerSettings
  ): string | undefined {
    let solution = variables.solution;
    if (!solution) {
      deepMerge(settings, { actions: { solution: false } });
    } else if (!settings?.actions?.solution || !variables['.meta']?.showSolution) {
      solution = undefined;
    }
    return solution;
  }

  /**
   * Ensures that feedbacks are not sent to the user if disabled in `settings`.
   * @param variables Exercise variables
   * @param settings Exercise settings.
   * @returns The feedbacks to show to the user if applicable otherwise `undefined`.
   */
  private withFeedbacksGuard(
    variables: ExerciseVariables,
    settings: PlayerSettings
  ): ExerciseFeedback[] | undefined {
    let feedbacks = Array.isArray(variables.feedback)
      ? variables.feedback
      : variables.feedback
        ? [variables.feedback]
        : [];

    if (!settings?.feedback?.validation) {
      feedbacks = [];
    }
    return feedbacks;
  }

}

type ActionHandler = (input: EvalExerciseInput, user?: User) => Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]>;

interface CreateSessionArgs {
  user?: User,
  source: PLSourceFile,
  parentId?: string,
  overrides?: Variables
  courseActivityId?: string,
}
