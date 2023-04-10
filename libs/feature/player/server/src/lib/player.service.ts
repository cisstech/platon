/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ForbiddenResponse, NotFoundResponse, User } from '@platon/core/common';
import { ActivityExercise, ActivityVariables, ExerciseVariables, PLSourceFile, Variables, extractExercisesFromActivityVariables } from '@platon/feature/compiler';
import { ActivityEntity, ActivityService } from '@platon/feature/course/server';
import { EvalExerciseInput, ExercisePlayer, PlayActivityOuput, PlayExerciseOuput, PlayerActions, PlayerActivityVariables, PlayerExercise, PlayerNavigation, PreviewInput } from '@platon/feature/player/common';
import { ResourceFileService } from '@platon/feature/resource/server';
import { AnswerStates, answerStateFromGrade } from '@platon/feature/result/common';
import { AnswerService, SessionEntity, SessionService } from '@platon/feature/result/server';
import { DataSource, EntityManager } from 'typeorm';
import { withAnswersInSession } from './player-answer';
import { withActivityFeedbacksGuard, withMultiSessionGuard, withSessionAccessGuard } from './player-guards';
import { updateActivityNavigationState } from './player-navigation';
import { withActivityPlayer, withExercisePlayer } from './player-renderer';
import { PreviewOuputDTO } from './player.dto';
import { SandboxService } from './sandboxes/sandbox.service';


type ActionHandler = (
  input: EvalExerciseInput,
  user?: User
) => Promise<ExercisePlayer | [ExercisePlayer, PlayerNavigation]>;

interface CreateSessionArgs {
  user?: User,
  source: PLSourceFile,
  parentId?: string,
  overrides?: Variables
  activity?: ActivityEntity,
}

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
    private readonly sandboxService: SandboxService,
    private readonly answerService: AnswerService,
    private readonly sessionService: SessionService,
    private readonly activityService: ActivityService,
    private readonly resourceFileService: ResourceFileService,
  ) { }

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
    const [source, resource] = await this.resourceFileService.compile(
      input.resource,
      input.version,
    );
    const session = await this.createNewSession({ source });
    return {
      exercise: resource.type === 'EXERCISE' ? withExercisePlayer(session) : undefined,
      activity: resource.type === 'ACTIVITY' ? withActivityPlayer(session) : undefined,
    }
  }

  async answers(sessionId: string): Promise<ExercisePlayer[]> {
    const session = await this.sessionService.findById(
      sessionId, { parent: true, activity: true, correction: true }
    );
    if (!session) throw new NotFoundResponse('Session not found');
    const answers = await this.answerService.findAllOfSession(sessionId);
    return answers.map(answer => withExercisePlayer(session, answer))
  }

  async playActivity(
    activityId: string,
    user: User
  ): Promise<PlayActivityOuput> {
    let activitySession = await this.sessionService.ofActivity(
      activityId,
      user.id
    );
    if (!activitySession) {
      const activity = await this.activityService.findById(
        activityId,
        user
      );
      activitySession = await this.createNewSession({
        user,
        activity,
        source: activity.source,
      });
    }
    return { activity: withActivityPlayer(activitySession) }
  }

  async playExercises(
    activitySessionId: string,
    exerciseSessionIds: string[],
    user?: User
  ): Promise<PlayExerciseOuput> {
    const activitySession = await this.sessionService.findById<PlayerActivityVariables>(
      activitySessionId,
      { parent: false, activity: true }
    );
    if (!activitySession) {
      throw new NotFoundResponse(`ActivitySession not found: ${activitySessionId}`);
    }

    // CREATE PLAYERS
    const exercisePlayers = await Promise.all(
      exerciseSessionIds.map(async (sessionId) => {
        const exerciseSession = withSessionAccessGuard(
          await this.sessionService.ofExercise(activitySessionId, sessionId),
          user
        );
        exerciseSession.parent = activitySession;
        exerciseSession.startedAt = exerciseSession.startedAt || new Date()
        await this.sessionService.update(exerciseSession.id, {
          startedAt: exerciseSession.startedAt
        });
        return withExercisePlayer(exerciseSession);
      })
    );

    // UPDATE ACTIVITY NAVIGATION
    const activityVariables = activitySession.variables;
    updateActivityNavigationState(activityVariables, exerciseSessionIds[0]);
    activitySession.variables = activityVariables;
    activitySession.startedAt = activitySession.startedAt || new Date();
    await this.sessionService.update(activitySessionId, {
      variables: activitySession.variables,
      startedAt: activitySession.startedAt
    });

    return {
      exercises: exercisePlayers,
      navigation: activityVariables.navigation,
    }
  }

  async terminateSession(
    sessionId: string,
    user?: User
  ): Promise<PlayActivityOuput> {
    const session = withSessionAccessGuard(
      await this.sessionService.findById(sessionId, { parent: true, activity: true }),
      user,
    );

    const activitySession = session.parent || session;
    const activityVariables = activitySession.variables as PlayerActivityVariables;
    activityVariables.navigation.terminated = true;
    activitySession.variables = activityVariables;
    await this.sessionService.update(activitySession.id, {
      variables: activitySession.variables
    });

    return {
      activity: withActivityPlayer(activitySession)
    }
  }

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
    const exerciseSession = withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId, { parent: true, activity: true }),
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

    return withExercisePlayer(exerciseSession);
  }

  async nextHint(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId, { parent: true, activity: true }),
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

    await this.sessionService.update(exerciseSession.id, { variables });

    return withExercisePlayer(exerciseSession);
  }

  async checkAnswer(
    input: EvalExerciseInput,
    user?: User
  ): Promise<[ExercisePlayer, PlayerNavigation]> {
    const exerciseSession = withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId, { parent: true, activity: true }),
      user
    );

    const { activitySession, activityNavigation } = withMultiSessionGuard(exerciseSession);

    // EVAL ANSWERS

    withAnswersInSession(exerciseSession, input.answers || {});

    const envid = exerciseSession.envid;
    let variables = exerciseSession.variables as ExerciseVariables;

    const output = await this.sandboxService.run({ envid, variables }, variables.grader);
    const grade = Number.parseInt(output.variables.grade) ?? -1;

    variables = output.variables as ExerciseVariables;

    variables['.meta'] = {
      ...(variables['.meta'] || {}),
      attempts: (variables['.meta']?.attempts || 0) + 1,
    };

    exerciseSession.grade = Math.max(grade, exerciseSession.grade ?? -1);
    exerciseSession.attempts++;
    exerciseSession.variables = variables;

    // SAVE ANSWER WITH GRADE

    const answer = await this.answerService.create({
      sessionId: exerciseSession.id,
      userId: exerciseSession.userId,
      variables: exerciseSession.variables,
      grade
    });

    const promises: Promise<unknown>[] = [
      this.sessionService.update(exerciseSession.id, {
        grade: exerciseSession.grade,
        attempts: exerciseSession.attempts,
        variables: exerciseSession.variables,
        lastGradedAt: new Date(),
      })
    ];

    // UPDATE NAVIGATION ACCORDING TO GRADE

    if (activitySession && activityNavigation) {
      const current = activityNavigation.exercises.find(item => item.sessionId === exerciseSession.id);
      if (current) {
        current.state = answerStateFromGrade(answer.grade);
        activityNavigation.exercises = activityNavigation.exercises.map(item => (
          item.sessionId === current.sessionId ? current : item
        ));
      }

      const childs = await this.sessionService.findAllWithParent(activitySession.id);
      activitySession.grade = grade
      childs.forEach(child => {
        if (child.id !== exerciseSession.id && typeof child.grade === 'number' && child.grade !== -1) {
          activitySession.grade += child.grade;
        }
      });

      if (activitySession.grade && activitySession.grade > 0 && childs.length) {
        activitySession.grade /= childs.length;
      }

      activitySession.attempts++;
      promises.push(
        this.sessionService.update(activitySession.id, {
          grade: activitySession.grade,
          attempts: activitySession.attempts,
          variables: {
            ...activitySession.variables,
            navigation: activityNavigation
          } as PlayerActivityVariables,
          lastGradedAt: new Date(),
        })
      );
    }

    await Promise.all(promises);

    return [
      withExercisePlayer(exerciseSession),
      activitySession
        ? (
          withActivityFeedbacksGuard(activitySession).variables as ActivityVariables
        ).navigation
        : undefined
    ]
  }

  async nextExercise(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId, { parent: true, activity: true }),
      user
    );

    const activitySession = exerciseSession.parent;
    if (!activitySession) {
      throw new ForbiddenResponse(`This action can be called only with dynamic activities.`)
    }

    activitySession.activity = activitySession.activity ?? exerciseSession.activity;
    withAnswersInSession(exerciseSession, input.answers || {});

    // TODO define the api for dynamic activities

    return withExercisePlayer(exerciseSession);
  }

  async showSolution(
    input: EvalExerciseInput,
    user?: User
  ): Promise<ExercisePlayer> {
    const exerciseSession = withSessionAccessGuard(
      await this.sessionService.findById(input.sessionId, { parent: true, activity: true }),
      user
    );

    withAnswersInSession(exerciseSession, input.answers || {});

    const variables = exerciseSession.variables as ExerciseVariables;
    variables['.meta'] = {
      ...(variables['.meta'] || {}),
      showSolution: true,
    };

    return withExercisePlayer(exerciseSession);
  }


  /**
   * Builds the given resource and creates new session.
   * @param args Build args.
   * @returns An player instance for the created session.
   */
  private async createNewSession(
    args: CreateSessionArgs,
    entityManager?: EntityManager
  ): Promise<SessionEntity> {
    const create = async (
      manager: EntityManager
    ): Promise<SessionEntity> => {
      const {
        user,
        source,
        parentId,
        activity,
      } = args;
      const { envid, variables } = await this.sandboxService.build(source);

      const session = await this.sessionService.create({
        activity,
        variables,
        envid: envid || null as any,
        userId: user?.id || null as any,
        parentId: parentId || null as any,
        activityId: activity?.id || null as any,
      }, manager);

      if (source.abspath.endsWith('.pla')) {
        session.variables = await this.createNavigation(
          variables as PlayerActivityVariables,
          session,
          user,
          manager
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
    const navigation = variables.navigation || {};
    navigation.started = navigation.started ?? false;
    navigation.terminated = navigation.terminated ?? false;

    const exercises = (navigation.exercises || []) as (PlayerExercise | ActivityExercise)[]

    if (!exercises.length) {
      exercises.push(
        ...extractExercisesFromActivityVariables(variables)
      );
    }

    navigation.exercises = await Promise.all(
      exercises.map(async item => {
        if (!('sessionId' in item)) {
          const session = await this.createNewSession({
            activity: activitySession.activity,
            parentId: activitySession.id,
            source: item.source,
            user,
          }, manager);
          return {
            id: item.id,
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
}
