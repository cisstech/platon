import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PartialDeep } from 'type-fest'
import { EntityManager, FindOptionsRelations, IsNull, Repository } from 'typeorm'
import { ExerciseSessionEntity, SessionEntity } from './session.entity'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { Session } from '@platon/feature/result/common'
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>
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

  create<TVariables>(
    input: Partial<SessionEntity<TVariables>>,
    entityManager?: EntityManager
  ): Promise<SessionEntity<TVariables>> {
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
  }
}
