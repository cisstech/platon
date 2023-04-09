import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PlayerSessionEntity } from './session.entity';
import { ExerciseVariables } from '@platon/feature/compiler';
import { PlayerActivityVariables } from '@platon/feature/player/common';

@Injectable()
export class PlayerSessionService {
  constructor(
    @InjectRepository(PlayerSessionEntity)
    private readonly repository: Repository<PlayerSessionEntity>,
  ) { }

  findById<T extends object>(
    id: string,
    relations: FindOptionsRelations<PlayerSessionEntity>
  ): Promise<PlayerSessionEntity<T> | null> {
    return this.repository.findOne({
      where: { id },
      relations
    });
  }

  findAllWithParent(
    parentId: string
  ): Promise<PlayerSessionEntity<ExerciseVariables>[]> {
    return this.repository.find({
      where: { parentId },
    });
  }

  ofActivity(
    activityId: string,
    userId: string
  ): Promise<PlayerSessionEntity<PlayerActivityVariables> | null> {
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
    relations?: FindOptionsRelations<PlayerSessionEntity>
  ): Promise<PlayerSessionEntity<ExerciseVariables> | null> {
    return this.repository.findOne({
      where: { parentId, id: sessionId },
      relations
    });
  }

  create<T extends object>(
    input: Partial<PlayerSessionEntity>,
    entityManager?: EntityManager
  ): Promise<PlayerSessionEntity<T>> {
    if (entityManager) {
      return entityManager.save(
        entityManager.create(this.repository.target, input as PlayerSessionEntity)
      );
    }

    return this.repository.save(
      this.repository.create(input)
    );
  }

  async update(
    id: string,
    changes: QueryDeepPartialEntity<PlayerSessionEntity>,
    entityManager?: EntityManager
  ) {
    if (entityManager) {
      return entityManager.update(this.repository.target, { id }, changes);
    }
    return this.repository.update({ id }, changes);
  }
}
