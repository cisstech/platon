/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { ActivityVariables, ExerciseVariables, extractExercisesFromActivityVariables } from '@platon/feature/compiler';
import { ActivityEntity, ActivityMemberView } from '@platon/feature/course/server';
import { ActivityResults, AnswerStates, ExerciseResults, UserResults, emptyExerciseResults } from '@platon/feature/result/common';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { IsNull, Not, Repository } from 'typeorm';
import { SessionEntity } from './sessions/session.entity';


@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    @InjectRepository(ActivityMemberView)
    private readonly activityMemberView: Repository<ActivityMemberView>,

    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>
  ) { }

  async activityResults(activityId: string, userId?: string): Promise<ActivityResults> {
    const {
      activity,
      activityUsers,
      activitySessions,
      exerciseSessions
    } = await this.loadSessions(activityId, userId);

    const {
      userResults,
      userResultsIndex
    } = this.createUserResults(activityUsers);

    const {
      exerciseResults,
      exerciseResultsMapIndex
    } = this.createExerciseResults(activity, userResults)

    const exerciseIdBySessionId = new Map<string, string>();
    const exerciseSessionsByExerciseId = new Map<string, number>();

    activitySessions.forEach(session => {
      const navigation = (session.variables).navigation;
      navigation.exercises.forEach((exercise: any) => {
        exerciseIdBySessionId.set(exercise.sessionId, exercise.id);
        exerciseSessionsByExerciseId.set(exercise.id, 0);
        Object.values(AnswerStates).forEach(state => {
          if (state === exercise.state) {
            exerciseResultsMapIndex[exercise.id].states[state]++;
          }
        });
        const userExercise = userResultsIndex[session.userId as string].exercises[exercise.id];
        userExercise.state = exercise.state;
      })
    });

    exerciseSessions.forEach(session => {
      const exerciseId = exerciseIdBySessionId.get(session.id);
      if (exerciseId) {
        exerciseSessionsByExerciseId.set(
          exerciseId,
          (exerciseSessionsByExerciseId.get(exerciseId) || 0) + 1
        );

        const duration = session.lastGradedAt && session.startedAt
          ? differenceInSeconds(session.lastGradedAt, session.startedAt)
          : 0;

        const grade = session.correction ?? session.grade;

        const exercise = exerciseResultsMapIndex[exerciseId];
        exercise.grades.sum += (grade === -1 ? 0 : grade);
        exercise.attempts.sum += session.attempts;
        exercise.durations.sum += duration;

        const userExercise = userResultsIndex[session.userId as string].exercises[exerciseId];
        userExercise.grade = grade;
        userExercise.attempts = session.attempts;
        userExercise.duration = duration;
        userExercise.sessionId = session.id;
      }
    });

    exerciseResults.forEach(exercise => {
      const count = exerciseSessionsByExerciseId.get(exercise.id);
      exercise.grades.avg = count ? exercise.grades.sum / count : exercise.grades.sum;
      exercise.attempts.avg = count ? exercise.attempts.sum / count : exercise.attempts.sum;
      exercise.durations.avg = count ? exercise.durations.sum / count : exercise.durations.sum;
    });

    return { users: userResults, exercises: exerciseResults }
  }

  private async loadSessions(activityId: string, userId?: string) {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId }
    });

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity: ${activityId}`);
    }

    const [activityUsers, activitySessions, exerciseSessions] = await Promise.all([
      this.activityMemberView.find({
        where: { courseId: activity.courseId, activityId: activity.id },
      }),
      this.sessionRepository.find({
        where: {
          activityId,
          parentId: IsNull(),
          ...(userId ? { userId } : {})
        },
        relations: { user: true }
      }),
      this.sessionRepository.find({
        where: {
          activityId,
          parentId: Not(IsNull()),
          ...(userId ? { userId } : {})
        }
      })
    ])

    const sessionUsers = activitySessions.filter(session => {
      return !userId || session.user?.id === userId;
    })
      .filter(session => !activityUsers.some(activityUser => activityUser.id === session.userId))
      .map(session => ({
        id: session.user?.id as string,
        username: session.user?.username as string,
        firstName: session.user?.firstName as string,
        lastName: session.user?.lastName as string,
        email: session.user?.email as string,
      }) as ActivityMemberView)

    activityUsers.push(...sessionUsers as ActivityMemberView[])

    if (userId && (!activityUsers.some(user => user.id === userId))) {
      throw new NotFoundResponse(`User: ${userId}`);
    }

    return {
      activity,
      activityUsers: activityUsers.filter(user => {
        return !userId || user.id === userId;
      }),
      activitySessions,
      exerciseSessions,
    }
  }

  private createUserResults(activityUsers: ActivityMemberView[]) {
    const userResults = activityUsers.map(user => ({ ...user, exercises: {} }) as UserResults)
    const userResultsIndex = userResults.reduce((record, results) => {
      record[results.id] = results;
      return record;
    }, {} as Record<string, UserResults>);
    return {
      userResults,
      userResultsIndex
    }
  }

  private createExerciseResults(activity: ActivityEntity, userResults: UserResults[]) {
    const exerciseResults = extractExercisesFromActivityVariables(
      activity?.source.variables as ActivityVariables
    ).map(exercise => {
      userResults.forEach(user => {
        user.exercises[exercise.id] = {
          id: exercise.id,
          title: (exercise.source.variables as ExerciseVariables).title,
          grade: -1,
          attempts: 0,
          duration: 0,
          state: AnswerStates.NOT_STARTED,
        }
      });
      return ({
        ...emptyExerciseResults(),
        id: exercise.id,
        title: (exercise.source.variables as ExerciseVariables).title,
      }) as ExerciseResults;
    });

    const exerciseResultsMapIndex = exerciseResults.reduce((record, results) => {
      record[results.id] = results;
      return record;
    }, {} as Record<string, ExerciseResults>);

    return {
      exerciseResults,
      exerciseResultsMapIndex
    }
  }
}
