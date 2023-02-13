import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { TopicEntity } from './topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly repository: Repository<TopicEntity>
  ) { }

  async findById(id: string): Promise<Optional<TopicEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { id } })
    );
  }

  async findAll(): Promise<[TopicEntity[], number]> {
    return this.repository.findAndCount({
      order: { name: 'ASC' }
    });
  }

  async create(user: Partial<TopicEntity>): Promise<TopicEntity> {
    return this.repository.save(user);
  }

  async update(id: string, changes: Partial<TopicEntity>): Promise<TopicEntity> {
    const topic = await this.repository.findOne({ where: { id } })
    if (!topic) {
      throw new NotFoundResponse(`Topic not found: ${id}`)
    }
    Object.assign(topic, changes);
    return this.repository.save(topic);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
