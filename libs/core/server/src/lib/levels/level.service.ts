import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { LevelEntity } from './level.entity'
import { EventService } from '../events'
import { ON_LEVEL_FUSION_EVENT, OnLevelFusionEventPayload } from './level.event'

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly repository: Repository<LevelEntity>,
    private readonly eventService: EventService
  ) {}

  async findById(id: string): Promise<Optional<LevelEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { id } }))
  }

  async findAll(): Promise<[LevelEntity[], number]> {
    return this.repository.findAndCount()
  }

  async create(user: Partial<LevelEntity>): Promise<LevelEntity> {
    return this.repository.save(user)
  }

  async update(id: string, changes: Partial<LevelEntity>): Promise<LevelEntity> {
    const level = await this.repository.findOne({ where: { id } })
    if (!level) {
      throw new NotFoundResponse(`Level not found: ${id}`)
    }

    if (changes.name) {
      const levelWithSameName = await this.repository.findOne({ where: { name: changes.name } })
      if (levelWithSameName && levelWithSameName.id !== id) {
        console.log('LevelService.update', level, levelWithSameName)
        this.eventService.emit<OnLevelFusionEventPayload>(ON_LEVEL_FUSION_EVENT, {
          oldLevel: level,
          newLevel: levelWithSameName,
        })
        Logger.log(`Level with name ${changes.name} already exists, merging levels`, 'LevelService')
        this.repository.delete(id).catch(console.error)
        return levelWithSameName
      }
    }
    Object.assign(level, changes)
    return this.repository.save(level)
  }

  async delete(id: string) {
    return this.repository.delete(id)
  }
}
