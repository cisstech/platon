import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PlayerAnswerEntity } from './answer.entity';

@Injectable()
export class PlayerAnswerService {
  constructor(
    @InjectRepository(PlayerAnswerEntity)
    private readonly repository: Repository<PlayerAnswerEntity>
  ) { }

  create(input: Partial<PlayerAnswerEntity>, entityManager?: EntityManager): Promise<PlayerAnswerEntity> {
    if (entityManager) {
      return entityManager.save(
        entityManager.create(this.repository.target, input as PlayerAnswerEntity)
      );
    }
    return this.repository.save(
      this.repository.create(input)
    );
  }
}
