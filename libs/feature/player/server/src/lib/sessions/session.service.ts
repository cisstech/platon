import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PlayerSessionEntity } from './session.entity';

@Injectable()
export class PlayerSessionService {
  constructor(
    @InjectRepository(PlayerSessionEntity)
    private readonly repository: Repository<PlayerSessionEntity>,
  ) { }


  findById(
    id: string,
    relations: FindOptionsRelations<PlayerSessionEntity> = {
      parent: true
    }) {
    return this.repository.findOne({
      where: { id },
      relations
    });
  }

  findAllWithParent(
    parentId: string) {
    return this.repository.find({
      where: { parentId },
    });
  }


  ofCourseActivity(
    courseActivityId: string,
    userId: string,
    relations: FindOptionsRelations<PlayerSessionEntity> = {
      parent: false
    }) {
    return this.repository.findOne({
      where: { parentId: IsNull(), courseActivityId, userId },
      relations
    });
  }

  ofExercise(
    parentId: string,
    sessionId: string,
    relations: FindOptionsRelations<PlayerSessionEntity> = {
      parent: true
    }
  ) {
    return this.repository.findOne({
      where: { parentId, id: sessionId },
      relations
    });
  }

  create(input: Partial<PlayerSessionEntity>, entityManager?: EntityManager): Promise<PlayerSessionEntity> {
    if (entityManager) {
      return entityManager.save(
        entityManager.create(this.repository.target, input as PlayerSessionEntity)
      );
    }

    return this.repository.save(
      this.repository.create(input)
    );
  }

  async update(id: string, changes: QueryDeepPartialEntity<PlayerSessionEntity>, entityManager?: EntityManager) {
    if (entityManager) {
      return entityManager.update(this.repository.target, { id }, changes);
    }
    return this.repository.update({ id }, changes);
  }
}
