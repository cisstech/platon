import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PartialDeep } from 'type-fest'
import { EntityManager, FindOptionsRelations, IsNull, Repository } from 'typeorm'
import { ExerciseSessionEntity, SessionEntity } from './session.entity'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { Session } from '@platon/feature/result/common'
import { SessionDataEntity } from './session-data.entity'
import * as path from 'path'
import { promises as fs } from 'fs'
import { resolveFileReference } from '@platon/core/common'
import { ResourceFileService } from '@platon/feature/resource/server'
import { OnEvent } from '@nestjs/event-emitter'
import {
  ON_CLOSE_ACTIVITY_EVENT,
  ON_REOPEN_ACTIVITY_EVENT,
  OnReopenActivityEventPayload,
} from '@platon/feature/course/server'

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
    @InjectRepository(SessionDataEntity)
    private readonly repositoryData: Repository<SessionDataEntity>,
    private readonly ressourceFileService: ResourceFileService
  ) {}

  findById<T extends object>(
    id: string,
    relations: FindOptionsRelations<SessionEntity>
  ): Promise<SessionEntity<T> | null> {
    return this.repository.findOne({
      where: { id },
      relations,
    })
  }

  findAllWithParent(parentId: string): Promise<SessionEntity[]> {
    return this.repository.find({
      where: { parentId },
    })
  }

  findUserActivity(activityId: string, userId: string): Promise<SessionEntity | null> {
    return this.repository.findOne({
      where: { parentId: IsNull(), activityId, userId },
      relations: {
        activity: true,
      },
    })
  }

  findExerciseSessionById(
    id: string,
    relations?: FindOptionsRelations<SessionEntity>
  ): Promise<ExerciseSessionEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations,
    })
  }

  findExerciseSessionByActivityId(
    parentId: string,
    sessionId: string,
    relations?: FindOptionsRelations<SessionEntity>
  ): Promise<ExerciseSessionEntity | null> {
    return this.repository.findOne({
      where: { parentId, id: sessionId },
      relations,
    })
  }

  async create<TVariables>(
    input: Partial<SessionEntity<TVariables>>,
    entityManager?: EntityManager
  ): Promise<SessionEntity<TVariables>> {
    input.source?.dependencies?.forEach(async (dependency) => {
      const hash = dependency.hash
      const { resource, relpath, version } = resolveFileReference('/' + dependency.abspath, {
        resource: input.source?.resource || '',
      })
      const newPath = path.join('resources/media', dependency.hash[0], hash)

      try {
        await fs.mkdir(path.dirname(newPath), { recursive: true })
        await fs.writeFile(newPath, await this.ressourceFileService.getFileContent(resource, relpath, version))
      } catch (error: unknown) {
        if (!(error instanceof Error && (error as NodeJS.ErrnoException).code === 'EEXIST')) {
          console.error('Link creation error: ', error)
        }
      }
    })

    if (entityManager) {
      return entityManager.save(entityManager.create(this.repository.target, input as SessionEntity<TVariables>))
    }

    return this.repository.save(this.repository.create(input as SessionEntity<TVariables>))
  }

  async update(id: string, changes: PartialDeep<Session>, entityManager?: EntityManager): Promise<void> {
    if (entityManager) {
      await entityManager.update(this.repository.target, { id }, changes as QueryDeepPartialEntity<SessionEntity>)
    }

    await this.repository.update({ id }, changes as QueryDeepPartialEntity<SessionEntity>)
    //////////////////////// UPDATE SESSIONDATA ////////////////////////////////////
    const sessionDatasNewValues: SessionDataEntity[] = await this.retrieveSessionDataWithoutManager(id)
    const sessionDatasToUpdate: SessionDataEntity[] = await this.repositoryData.findBy({ id: id })
    if (sessionDatasNewValues.length == 0 || sessionDatasToUpdate.length === 0) {
      return
    }
    sessionDatasToUpdate.forEach((sessionDataToUpdate: SessionDataEntity) => {
      const sessionDataNewValue = sessionDatasNewValues.find(
        (sessionDataNewValue: SessionDataEntity) => sessionDataNewValue.id === sessionDataToUpdate.id
      )
      if (!sessionDataNewValue) {
        return
      }
      sessionDataToUpdate.userId = sessionDataNewValue.userId
      sessionDataToUpdate.parentId = sessionDataNewValue.parentId
      sessionDataToUpdate.grade = sessionDataNewValue.grade
      sessionDataToUpdate.attempts = sessionDataNewValue.attempts
      sessionDataToUpdate.createdAt = sessionDataNewValue.createdAt
      sessionDataToUpdate.updatedAt = sessionDataNewValue.updatedAt
      sessionDataToUpdate.lastGradedAt = sessionDataNewValue.lastGradedAt
      sessionDataToUpdate.startedAt = sessionDataNewValue.startedAt
      sessionDataToUpdate.resourceVersion = sessionDataNewValue.resourceVersion
      sessionDataToUpdate.exerciseMeta = sessionDataNewValue.exerciseMeta
      sessionDataToUpdate.activityNavigation = sessionDataNewValue.activityNavigation
      sessionDataToUpdate.resourceId = sessionDataNewValue.resourceId
      sessionDataToUpdate.resourceType = sessionDataNewValue.resourceType
      sessionDataToUpdate.resourceName = sessionDataNewValue.resourceName
      sessionDataToUpdate.resourceOwnerId = sessionDataNewValue.resourceOwnerId
      sessionDataToUpdate.circleId = sessionDataNewValue.circleId
      sessionDataToUpdate.circleName = sessionDataNewValue.circleName
      sessionDataToUpdate.correctionId = sessionDataNewValue.correctionId
      sessionDataToUpdate.correctionGrade = sessionDataNewValue.correctionGrade
      sessionDataToUpdate.correctionAuthor = sessionDataNewValue.correctionAuthor
      sessionDataToUpdate.correctionEnabled = sessionDataNewValue.correctionEnabled
      sessionDataToUpdate.activityId = sessionDataNewValue.activityId
      sessionDataToUpdate.activityOpenAt = sessionDataNewValue.activityOpenAt
      sessionDataToUpdate.activityCloseAt = sessionDataNewValue.activityCloseAt
      sessionDataToUpdate.activityCreatorId = sessionDataNewValue.activityCreatorId
      sessionDataToUpdate.activityCreatedAt = sessionDataNewValue.activityCreatedAt
      sessionDataToUpdate.courseId = sessionDataNewValue.courseId
      sessionDataToUpdate.courseName = sessionDataNewValue.courseName
      sessionDataToUpdate.courseCreatedAt = sessionDataNewValue.courseCreatedAt
      sessionDataToUpdate.courseOwnerId = sessionDataNewValue.courseOwnerId
      sessionDataToUpdate.topics = sessionDataNewValue.topics
      sessionDataToUpdate.levels = sessionDataNewValue.levels
      sessionDataToUpdate.answers = sessionDataNewValue.answers
    })
    await this.repositoryData.save(sessionDatasToUpdate)
  }

  async retrieveSessionDataWithoutManager(sessionId: string): Promise<SessionDataEntity[]> {
    const result = await this.repositoryData.query(
      `SELECT
    session.id,
    session.user_id,
    session.parent_id,
    session.grade,
    session.attempts,
    session.created_at,
    session.updated_at,
    session.last_graded_at,
    session.started_at,
    session.source->>'version' AS resource_version,
    session.variables->'.meta' AS exercise_meta,
    session.variables->'navigation' AS activity_navigation,
    resource.id AS resource_id,
    resource.type AS resource_type,
    resource.name AS resource_name,
    resource.owner_id AS resource_owner_id,
    circle.id AS circle_id,
    circle.name AS circle_name,
    correction.id AS correction_id,
    correction.grade AS correction_grade,
    correction.author_id AS correction_author,
    CASE
        WHEN correctors.id IS NOT NULL THEN true
        ELSE false
    END AS correction_enabled,
    activity.id AS activity_id,
    activity.open_at AS activity_open_at,
    activity.close_at AS activity_close_at,
    activity.creator_id AS activity_creator_id,
    activity.created_at AS activity_created_at,
    course.id AS course_id,
    course.name AS course_name,
    course.created_at AS course_created_at,
    course.owner_id AS course_owner_id,
    topics.matches AS topics,
    levels.matches AS levels,
    answers.matches AS answers
FROM "Sessions" session
INNER JOIN "Resources" resource ON resource.id = CAST(session.source->>'resource' AS uuid)
INNER JOIN "Resources" circle ON circle.id = resource.parent_id
LEFT JOIN "Corrections" correction ON session.correction_id = correction.id
LEFT JOIN "Activities" activity ON activity.id = session.activity_id
LEFT JOIN "Courses" course ON course.id = activity.course_id
LEFT JOIN (
    SELECT
        answer.session_id,
        jsonb_agg(
            jsonb_build_object(
                'grade', answer.grade,
                'createdAt', answer.created_at
            )
            ORDER BY answer.created_at ASC
        ) AS matches
    FROM "Answers" answer
    GROUP BY answer.session_id
) answers ON answers.session_id = session.id
LEFT JOIN (
    SELECT id, activity_id FROM "ActivityCorrectors" corrector LIMIT 1
) AS correctors ON correctors.id IS NOT NULL AND correctors.activity_id = session.activity_id
LEFT JOIN (
    SELECT
        resource_id,
        json_agg(topic.name) AS matches
    FROM "ResourceTopics"
    INNER JOIN "Topics" topic ON topic.id = topic_id
    GROUP BY resource_id
) AS topics ON topics.resource_id = resource.id OR topics.resource_id = circle.id
LEFT JOIN (
    SELECT
        resource_id,
        json_agg(level.name) AS matches
    FROM "ResourceLevels"
    INNER JOIN "Levels" level ON level.id = level_id
    GROUP BY resource_id
) AS levels ON levels.resource_id = resource.id OR levels.resource_id = circle.id
WHERE session.id = $1;
`,
      [sessionId]
    )
    if (!result || result.length === 0) {
      return []
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionDataList: SessionDataEntity[] = result.map((data: any) => {
      const sessionData = new SessionDataEntity()
      sessionData.id = data.id
      sessionData.userId = data.user_id
      sessionData.parentId = data.parent_id
      sessionData.grade = data.grade
      sessionData.attempts = data.attempts
      sessionData.createdAt = data.created_at
      sessionData.updatedAt = data.updated_at
      sessionData.lastGradedAt = data.last_graded_at
      sessionData.startedAt = data.started_at
      sessionData.resourceVersion = data.resource_version
      sessionData.exerciseMeta = data.exercise_meta
      sessionData.activityNavigation = data.activity_navigation
      sessionData.resourceId = data.resource_id
      sessionData.resourceType = data.resource_type
      sessionData.resourceName = data.resource_name
      sessionData.resourceOwnerId = data.resource_owner_id
      sessionData.circleId = data.circle_id
      sessionData.circleName = data.circle_name
      sessionData.correctionId = data.correction_id
      sessionData.correctionGrade = data.correction_grade
      sessionData.correctionAuthor = data.correction_author
      sessionData.correctionEnabled = data.correction_enabled
      sessionData.activityId = data.activity_id
      sessionData.activityOpenAt = data.activity_open_at
      sessionData.activityCloseAt = data.activity_close_at
      sessionData.activityCreatorId = data.activity_creator_id
      sessionData.activityCreatedAt = data.activity_created_at
      sessionData.courseId = data.course_id
      sessionData.courseName = data.course_name
      sessionData.courseCreatedAt = data.course_created_at
      sessionData.courseOwnerId = data.course_owner_id
      sessionData.topics = data.topics
      sessionData.levels = data.levels
      sessionData.answers = data.answers
      return sessionData
    })
    return sessionDataList
  }

  @OnEvent(ON_REOPEN_ACTIVITY_EVENT)
  async onReopenActivity({ activityId }: OnReopenActivityEventPayload): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SessionEntity)
      .set({
        variables: () => `jsonb_set(variables, '{navigation,terminated}', 'false', false)`,
      })
      .where('activity_id = :activityId and parent_id is null', { activityId })
      .execute()
  }

  @OnEvent(ON_CLOSE_ACTIVITY_EVENT)
  async onCloseActivity({ activityId }: OnReopenActivityEventPayload): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SessionEntity)
      .set({
        variables: () => `jsonb_set(variables, '{navigation,terminated}', 'true', false)`,
      })
      .where('activity_id = :activityId and parent_id is null', { activityId })
      .execute()
  }
}
