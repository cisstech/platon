/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { EventService } from '@platon/core/server'
import { ON_CORRECT_ACTIVITY_EVENT, OnCorrectActivityEventPayload } from '@platon/feature/course/server'
import { ActivityCorrection, ExerciseCorrection } from '@platon/feature/result/common'
import { Repository } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'
import { CorrectionEntity } from './correction.entity'

@Injectable()
export class CorrectionService {
  constructor(
    private readonly eventService: EventService,

    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(CorrectionEntity)
    private readonly correctionRepository: Repository<CorrectionEntity>
  ) {}

  /**
   * List all activities that need to be corrected or have been corrected by the user identified by `userId`.
   *
   * @remarks
   * - If `activityId` is provided, only the activity with the given id is returned.
   * - Only activities that have been terminated are returned.
   * @param correctorUserId The id of the user who will correct the activities.
   * @param activityId An optional activity id to filter the results.
   * @returns A list of activities to correct.
   */
  async list(correctorUserId: string, activityId?: string): Promise<ActivityCorrection[]> {
    type Projection = {
      userId: string
      activityId: string
      activityName: string
      activityNavigation: any
      activitySessionId: string
      exerciseSessionId: string
      courseId: string
      courseName: string
      correctedBy?: string
      correctedAt?: Date
      correctedGrade?: number
      grade?: number
    }

    // Construct SQL query and parameters
    const queryText = `
    SELECT
      activity.id as "activityId",
      activity.source->'variables'->>'title' as "activityName",
      (activity_session.variables->>'navigation')::jsonb as "activityNavigation",
      activity_session.id as "activitySessionId",
      exercise_session.user_id as "userId",
      exercise_session.id as "exerciseSessionId",
      course.id as "courseId",
      course.name as "courseName",
      correction.author_id as "correctedBy",
      COALESCE(correction.updated_at, correction.created_at) as "correctedAt",
      correction.grade as "correctedGrade",
      exercise_session.grade as "grade"
    FROM "Sessions" exercise_session
    INNER JOIN "Sessions" activity_session ON activity_session.id=exercise_session.parent_id
    INNER JOIN "Activities" activity ON activity.id=exercise_session.activity_id
    INNER JOIN "Courses" course ON course.id=activity.course_id
    LEFT JOIN "Corrections" correction ON correction.id=exercise_session.correction_id
    WHERE
      ${activityId ? 'activity.id=$2 AND' : ''}
      exercise_session.user_id<>$1 AND
      (activity_session.variables->'navigation'->>'terminated')::boolean = TRUE AND
      EXISTS (
        SELECT 1 FROM "ActivityCorrectorView" corrector
        WHERE corrector.activity_id=activity.id AND corrector.id=$1
      )
  `
    const queryParams = activityId ? [correctorUserId, activityId] : [correctorUserId]

    const projections = (await this.sessionRepository.query(queryText, queryParams)) as Projection[]

    const activityMap = new Map<string, ActivityCorrection>()

    projections.forEach((projection) => {
      const navItem = projection.activityNavigation.exercises.find(
        (item: any) => item.sessionId === projection.exerciseSessionId
      )

      const exercise: ExerciseCorrection = {
        userId: projection.userId,
        activitySessionId: projection.activitySessionId,
        exerciseSessionId: projection.exerciseSessionId,
        correctedBy: projection.correctedBy,
        correctedAt: projection.correctedAt,
        correctedGrade: projection.correctedGrade,
        grade: projection.grade,
        exerciseId: navItem.id,
        exerciseName: navItem.title,
      }

      if (!activityMap.has(projection.activityId)) {
        activityMap.set(projection.activityId, {
          activityId: projection.activityId,
          activityName: projection.activityName,
          courseId: projection.courseId,
          courseName: projection.courseName,
          exercises: [exercise],
        })
      } else {
        activityMap.get(projection.activityId)?.exercises.push(exercise)
      }
    })

    return Array.from(activityMap.values())
  }

  async upsert(sessionId: string, input: Partial<CorrectionEntity>) {
    const exerciseSession = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: { correction: true, parent: true, activity: true },
    })

    if (!exerciseSession) throw new NotFoundResponse(`Session not found: ${sessionId}`)
    if (!exerciseSession.parent) throw new NotFoundResponse(`Parent session not found: ${sessionId}`)

    let correction: CorrectionEntity
    if (exerciseSession.correction) {
      Object.assign(exerciseSession.correction, input)
      await this.correctionRepository.save(exerciseSession.correction)
      correction = exerciseSession.correction
    } else {
      correction = await this.correctionRepository.save(input)
      await this.sessionRepository.update(exerciseSession.id, {
        correctionId: correction.id,
      })
    }

    const activitySession = exerciseSession.parent
    const activityExerciseSessions = await this.sessionRepository.find({
      where: { parentId: activitySession.id },
      relations: { correction: true },
    })

    let terminated = true
    let grade = 0
    activityExerciseSessions.forEach((session) => {
      if (!session.correction) terminated = false
      else grade += session.correction.grade
    })

    if (terminated) {
      if (grade && activityExerciseSessions.length) {
        activitySession.grade = grade / activityExerciseSessions.length
        await this.sessionRepository.save(activitySession)
      }

      if (exerciseSession.activity && exerciseSession.userId) {
        this.eventService.emit<OnCorrectActivityEventPayload>(ON_CORRECT_ACTIVITY_EVENT, {
          userId: exerciseSession.userId,
          activity: exerciseSession.activity,
        })
      }
    }

    return correction
  }
}
