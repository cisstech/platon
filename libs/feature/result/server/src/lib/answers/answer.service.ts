import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AnswerEntity } from './answer.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly repository: Repository<AnswerEntity>
  ) { }

  create(input: Partial<AnswerEntity>, entityManager?: EntityManager): Promise<AnswerEntity> {
    if (entityManager) {
      return entityManager.save(
        entityManager.create(this.repository.target, input as AnswerEntity)
      );
    }
    return this.repository.save(
      this.repository.create(input)
    );
  }
}
