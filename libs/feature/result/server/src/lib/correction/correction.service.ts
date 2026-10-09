import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { EventService } from '@platon/core/server'
import { ON_CORRECT_ACTIVITY_EVENT, OnCorrectActivityEventPayload } from '@platon/feature/course/server'
import {
  ActivityCorrection,
  ActivityCorrectionSummary,
  CorrectionStatus,
  ExerciseCorrection,
  Label,
} from '@platon/feature/result/common'
import { Repository } from 'typeorm'
import { SessionEntity } from '../sessions/session.entity'
import { CorrectionEntity } from './correction.entity'

/**
 * An exercise that crashed before its student could answer still waits for a correction. Shared by
 * `list` and `listSummary`, so that the queue and its counts agree.
 */
const FAILED_BEFORE_ANSWER = `(exercise_session.variables->'.meta'->>'error')::boolean IS TRUE`

type Projection = {
  userId: string
  activityId: string
  activityName: string
  exerciseId: string
  activitySessionId: string
  exerciseSessionId: string
  courseId: string
  courseName: string
  correctedBy?: string
  correctedAt?: Date
  correctedGrade?: number
  grade?: number
  exerciseName: string
  hasUploads: boolean
  labels: Label[]
}

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
   * - If `viewerMode` is true, the corrector assignment constraint is ignored.
   * @param correctorUserId The id of the user who will correct the activities.
   * @param activityId An optional activity id to filter the results.
   * @param viewerMode Whether this is a read-only visualization request.
   * @returns A list of activities to correct.
   */
  async list(
    correctorUserId: string,
    activityId?: string,
    viewerMode = false,
    status?: CorrectionStatus
  ): Promise<ActivityCorrection[]> {
    // In viewer mode, list exercise sessions directly from the activity without requiring answers.
    // Uses a LEFT JOIN (not INNER) so exercises that crashed before the student could submit an
    // answer (no "Answers" row at all) are still listed, as long as the session itself recorded an error.
    const answerJoin = viewerMode
      ? ''
      : `LEFT JOIN LATERAL (
      SELECT * FROM "Answers" a
      WHERE a.session_id = exercise_session.id AND a.variables IS NOT NULL
      ORDER BY a.created_at DESC
      LIMIT 1
    ) answer ON true`

    const queryParams: string[] = []
    const userParam = viewerMode ? undefined : '$1'
    const activityParam = viewerMode ? '$1' : '$2'

    if (viewerMode) {
      if (activityId) {
        queryParams.push(activityId)
      }
    } else {
      queryParams.push(correctorUserId)
      if (activityId) {
        queryParams.push(activityId)
      }
    }

    const whereConditions = [
      activityId ? `activity.id=${activityParam}` : undefined,
      userParam ? `(exercise_session.user_id IS NULL OR exercise_session.user_id <> ${userParam})` : undefined,
      viewerMode ? undefined : `(answer.variables IS NOT NULL OR ${FAILED_BEFORE_ANSWER})`,
      viewerMode ? undefined : "(activity_session.variables->'navigation'->>'terminated')::boolean = TRUE",
      userParam
        ? `EXISTS (
        SELECT 1 FROM "ActivityCorrectorView" corrector
        WHERE corrector.activity_id=activity.id AND corrector.id=${userParam}
      )`
        : undefined,
    ].filter((condition): condition is string => !!condition)

    // Construct SQL query and parameters
    const queryText = `
    SELECT
      activity.id as "activityId",
      activity.source->'variables'->>'title' as "activityName",
      COALESCE(
        (SELECT elem->>'id'
         FROM jsonb_array_elements(
           COALESCE(activity_session.variables->'navigation'->'exercises', '[]'::jsonb)
         ) AS elem
         WHERE elem->>'sessionId' = exercise_session.id::text
         LIMIT 1),
        resources.id::text
      ) AS "exerciseId",
      resources."name" as "exerciseName",
      activity_session.id as "activitySessionId",
      exercise_session.user_id as "userId",
      exercise_session.id as "exerciseSessionId",
      course.id as "courseId",
      course.name as "courseName",
      correction.author_id as "correctedBy",
      COALESCE(correction.updated_at, correction.created_at) as "correctedAt",
      correction.grade as "correctedGrade",
      exercise_session.grade as "grade",
      CASE WHEN EXISTS (
        SELECT 1 FROM "StudentSubmissions"
        WHERE session_id = exercise_session.id
        LIMIT 1
      ) THEN true ELSE false END as "hasUploads",
      lbl.labels AS "labels"
    FROM "Sessions" exercise_session
    INNER JOIN "Resources" resources on resources.id = (exercise_session.source->>'resource')::uuid
    INNER JOIN "Sessions" activity_session ON activity_session.id=exercise_session.parent_id
    INNER JOIN "Activities" activity ON activity.id=exercise_session.activity_id
    INNER JOIN "Courses" course ON course.id=activity.course_id
    ${answerJoin}
    LEFT JOIN "Corrections" correction ON correction.id=exercise_session.correction_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color, 'description', l.description)
        ),
        '[]'::jsonb
      ) AS "labels"
      FROM "CorrectionLabels" cl
      INNER JOIN "Labels" l ON cl.label_id = l.id
      WHERE cl.session_id = exercise_session.id
    ) lbl ON true
    WHERE
      ${whereConditions.join(' AND\n      ')}
  `

    const allProjections = (await this.sessionRepository.query(queryText, queryParams)) as Projection[]

    const projections = this.filterProjectionsByStatus(allProjections, status)

    const activityMap = new Map<string, ActivityCorrection>()

    for (const projection of projections) {
      const exercise: ExerciseCorrection = {
        userId: projection.userId,
        activitySessionId: projection.activitySessionId,
        exerciseSessionId: projection.exerciseSessionId,
        correctedBy: projection.correctedBy,
        correctedAt: projection.correctedAt,
        correctedGrade: projection.correctedGrade,
        grade: projection.grade,
        exerciseId: projection.exerciseId,
        exerciseName: projection.exerciseName,
        hasUploads: projection.hasUploads,
        labels: projection.labels ?? [],
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
    }

    return Array.from(activityMap.values())
  }

  /**
   * One line per activity the user corrects: its exercises to correct, those corrected, and the
   * copies with at least one exercise still to correct. Counts the same exercises as `list`: answered
   * or crashed, of an exercise that still exists, outside the user's own copy. Aggregated per copy
   * first, so that no `COUNT(DISTINCT)` keeps PostgreSQL from hashing.
   */
  async listSummary(correctorUserId: string, status?: CorrectionStatus): Promise<ActivityCorrectionSummary[]> {
    let havingClause = ''
    if (status === CorrectionStatus.pending) {
      havingClause = 'HAVING SUM(copy.total) > SUM(copy.corrected)'
    } else if (status === CorrectionStatus.available) {
      havingClause = 'HAVING SUM(copy.total) = SUM(copy.corrected)'
    }

    const queryText = `
      WITH corrector_activities AS (
        SELECT DISTINCT activity_id, activity_name, course_id, course_name
        FROM "ActivityCorrectorView"
        WHERE id = $1
      ),
      copies AS (
        SELECT
          ts.activity_id,
          ts.id,
          COUNT(*) AS total,
          COUNT(correction.id) AS corrected
        FROM "Sessions" ts
        INNER JOIN "Sessions" exercise_session
          ON exercise_session.parent_id = ts.id
          AND (exercise_session.user_id IS NULL OR exercise_session.user_id <> $1)
        LEFT JOIN "Corrections" correction ON correction.id = exercise_session.correction_id
        WHERE ts.activity_id IN (SELECT activity_id FROM corrector_activities)
          AND ts.parent_id IS NULL
          AND (ts.variables->'navigation'->>'terminated')::boolean = TRUE
          AND (
            EXISTS (
              SELECT 1 FROM "Answers" a
              WHERE a.session_id = exercise_session.id AND a.variables IS NOT NULL
            )
            OR ${FAILED_BEFORE_ANSWER}
          )
          AND EXISTS (
            SELECT 1 FROM "Resources" r WHERE r.id = (exercise_session.source->>'resource')::uuid
          )
        GROUP BY ts.activity_id, ts.id
      )
      SELECT
        ca.activity_id AS "activityId",
        ca.activity_name AS "activityName",
        ca.course_id AS "courseId",
        ca.course_name AS "courseName",
        SUM(copy.total)::int AS "totalExercises",
        SUM(copy.corrected)::int AS "correctedExercises",
        COUNT(*) FILTER (WHERE copy.corrected < copy.total)::int AS "pendingCopies"
      FROM corrector_activities ca
      INNER JOIN copies copy ON copy.activity_id = ca.activity_id
      GROUP BY ca.activity_id, ca.activity_name, ca.course_id, ca.course_name
      ${havingClause}
      ORDER BY ca.course_name, ca.activity_id
    `

    const results = await this.sessionRepository.query(queryText, [correctorUserId])
    return results
  }

  private filterProjectionsByStatus(projections: Projection[], status?: CorrectionStatus): Projection[] {
    if (!status) return projections

    const pendingActivityIds = new Set(projections.filter((p) => p.correctedBy == null).map((p) => p.activityId))

    return projections.filter((p) =>
      status === CorrectionStatus.pending ? pendingActivityIds.has(p.activityId) : !pendingActivityIds.has(p.activityId)
    )
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
