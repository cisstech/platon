import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { LevelEntity } from './level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly repository: Repository<LevelEntity>
  ) { }

  async findById(id: string): Promise<Optional<LevelEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { id } })
    );
  }

  async findAll(): Promise<[LevelEntity[], number]> {
    return this.repository.findAndCount();
  }

  async create(user: Partial<LevelEntity>): Promise<LevelEntity> {
    return this.repository.save(user);
  }

  async update(id: string, changes: Partial<LevelEntity>): Promise<LevelEntity> {
    const level = await this.repository.findOne({ where: { id } })
    if (!level) {
      throw new NotFoundException(`Level not found: ${id}`)
    }
    Object.assign(level, changes);
    return this.repository.save(level);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
