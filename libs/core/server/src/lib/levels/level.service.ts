import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelEntity } from './level.entity';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly repository: Repository<LevelEntity>
  ) { }

  async findAll(): Promise<LevelEntity[]> {
    return this.repository.find();
  }

  async findAndCountAll(): Promise<[LevelEntity[], number]> {
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
