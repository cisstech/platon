import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { ActivityVariables, ExerciseVariables, extractExercisesFromActivityVariables } from '@platon/feature/compiler';
import { ActivityEntity, ActivityService } from '@platon/feature/course/server';
import { AnswerStates, PlayerActivityVariables } from '@platon/feature/player/common';
import { PlayerSessionEntity } from '@platon/feature/player/server';
import { ActivityResults, ExerciseResults, UserResults, emptyExerciseResults } from '@platon/feature/result/common';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class ResultService {
  constructor(
    private readonly activityService: ActivityService,

    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,

    @InjectRepository(PlayerSessionEntity)
    private readonly sessionRepository: Repository<PlayerSessionEntity>
  ) { }

  async activityResults(activityId: string): Promise<ActivityResults> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId }
    });

    if (!activity) {
      throw new NotFoundResponse(`CourseActivity: ${activityId}`);
    }

    const users = (
      await this.activityService.listUsers(
        activity.courseId,
        activity.id
      )
    ).map(participant => ({
      ...participant,
      exercises: {}
    }) as UserResults);

    const usersMap = users.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, UserResults>);

    const exercises = extractExercisesFromActivityVariables(
      activity?.source.variables as ActivityVariables
    ).map(exercise => {
      users.forEach(member => {
        member.exercises[exercise.id] = {
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
      });
    });

    const exercisesMap = exercises.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Record<string, ExerciseResults>);

    const exerciseIdBySessionIdMap = new Map<string, string>();
    const exerciseSessionCounterMap = new Map<string, number>();

    const activitySessions = await this.sessionRepository.find({
      where: { activityId: activityId, parentId: IsNull() }
    });

    const exerciseSessions = await this.sessionRepository.find({
      where: { activityId: activityId, parentId: Not(IsNull()) }
    });

    activitySessions.forEach(session => {
      const navigation = (session.variables as PlayerActivityVariables).navigation;
      navigation.exercises.forEach(exercise => {
        exerciseSessionCounterMap.set(exercise.id, 0);
        exerciseIdBySessionIdMap.set(exercise.sessionId, exercise.id);

        Object.values(AnswerStates).forEach(state => {
          if (state === exercise.state) {
            exercisesMap[exercise.id].states[state]++;
          }
        });

        const userExercise = usersMap[session.userId as string].exercises[exercise.id];
        userExercise.state = exercise.state;
      })
    });

    exerciseSessions.forEach(session => {
      const exerciseId = exerciseIdBySessionIdMap.get(session.id);
      if (exerciseId) {
        exerciseSessionCounterMap.set(
          exerciseId,
          (exerciseSessionCounterMap.get(exerciseId) || 0) + 1
        );

        const duration = session.lastGradedAt && session.startedAt
          ? differenceInSeconds(session.lastGradedAt, session.startedAt)
          : 0;

        const grade = session.correction ?? session.grade;

        exercisesMap[exerciseId].grades.sum += (grade === -1 ? 0 : grade);
        exercisesMap[exerciseId].attempts.sum += session.attempts;
        exercisesMap[exerciseId].durations.sum += duration;

        const userExercise = usersMap[session.userId as string].exercises[exerciseId];
        userExercise.grade = grade;
        userExercise.attempts = session.attempts;
        userExercise.duration = duration;
      }
    });

    exercises.forEach(exercise => {
      const count = exerciseSessionCounterMap.get(exercise.id);
      exercise.grades.avg = count ? exercise.grades.sum / count : exercise.grades.sum;
      exercise.attempts.avg = count ? exercise.attempts.sum / count : exercise.attempts.sum;
      exercise.durations.avg = count ? exercise.durations.sum / count : exercise.durations.sum;
    });

    return { users, exercises }
  }
}
