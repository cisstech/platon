import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SessionEntity } from './session.entity';


@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repository: Repository<SessionEntity>,
  ) { }

  findById<T extends object>(
    id: string,
    relations: FindOptionsRelations<SessionEntity>
  ): Promise<SessionEntity<T> | null> {
    return this.repository.findOne({
      where: { id },
      relations
    });
  }

  findAllWithParent(
    parentId: string
  ): Promise<SessionEntity[]> {
    return this.repository.find({
      where: { parentId },
    });
  }

  ofActivity(
    activityId: string,
    userId: string
  ): Promise<SessionEntity | null> {
    return this.repository.findOne({
      where: { parentId: IsNull(), activityId, userId },
      relations: {
        activity: true
      }
    });
  }

  ofExercise(
    parentId: string,
    sessionId: string,
    relations?: FindOptionsRelations<SessionEntity>
  ): Promise<SessionEntity | null> {
    return this.repository.findOne({
      where: { parentId, id: sessionId },
      relations
    });
  }

  create<T extends object>(
    input: Partial<SessionEntity>,
    entityManager?: EntityManager
  ): Promise<SessionEntity<T>> {
    if (entityManager) {
      return entityManager.save(
        entityManager.create(this.repository.target, input as SessionEntity)
      );
    }

    return this.repository.save(
      this.repository.create(input)
    );
  }

  async update(
    id: string,
    changes: QueryDeepPartialEntity<SessionEntity>,
    entityManager?: EntityManager
  ) {
    if (entityManager) {
      return entityManager.update(this.repository.target, { id }, changes);
    }
    return this.repository.update({ id }, changes);
  }
}
