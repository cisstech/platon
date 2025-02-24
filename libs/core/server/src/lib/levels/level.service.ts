import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { LevelEntity } from './level.entity'
import { EventService } from '../events'
import { ON_LEVEL_FUSION_EVENT, OnLevelFusionEventPayload } from './level.event'
import { StringUtilsService } from '../utils'

@Injectable()
export class LevelService {
  private readonly SIMILARITY_THRESHOLD = 0.8

  constructor(
    @InjectRepository(LevelEntity)
    private readonly repository: Repository<LevelEntity>,
    private readonly eventService: EventService,
    private readonly stringUtils: StringUtilsService
  ) {}

  async findById(id: string): Promise<Optional<LevelEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { id } }))
  }

  async findAll(): Promise<[LevelEntity[], number]> {
    return this.repository.findAndCount()
  }

  private async findSimilarLevel(newName: string, existingLevels: LevelEntity[]): Promise<LevelEntity | null> {
    const normalizedNewName = this.stringUtils.normalizeString(newName)

    for (const level of existingLevels) {
      const similarity = this.stringUtils.calculateSimilarity(
        normalizedNewName,
        this.stringUtils.normalizeString(level.name)
      )

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        return level
      }
    }

    return null
  }

  async create(level: Partial<LevelEntity>, force: boolean): Promise<{ level: LevelEntity; existing: boolean }> {
    if (force) {
      const newLevel = await this.repository.save(level)
      return { level: newLevel, existing: false }
    }

    const [existingLevels, _] = await this.findAll()
    const similarLevel = level.name ? await this.findSimilarLevel(level.name, existingLevels) : null

    // Si un level similaire existe, on le renvoie
    if (similarLevel) {
      return { level: similarLevel, existing: true }
    }

    const newLevel = await this.repository.save(level)
    return { level: newLevel, existing: false }
  }

  async update(id: string, changes: Partial<LevelEntity>): Promise<LevelEntity> {
    const level = await this.repository.findOne({ where: { id } })
    if (!level) {
      throw new NotFoundResponse(`Level not found: ${id}`)
    }

    if (changes.name) {
      const levelWithSameName = await this.repository.findOne({ where: { name: changes.name } })
      if (levelWithSameName && levelWithSameName.id !== id) {
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
