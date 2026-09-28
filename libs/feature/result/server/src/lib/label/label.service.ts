import { normalizeExerciseGroups } from '@platon/feature/compiler'
import { InjectRepository } from '@nestjs/typeorm'
import { LabelEntity } from './label.entity'
import { Repository } from 'typeorm'
import { CreateLabel } from '@platon/feature/result/common'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Optional } from 'typescript-optional'
import { UserFavoriteLabel } from './user-favorite-label/user-favorite-label.entity'
import { ActivityEntity } from '@platon/feature/course/server'
import { ResourceLabelEntity } from './resource-label/resource-label.entity'

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(LabelEntity)
    private readonly labelRepository: Repository<LabelEntity>,
    @InjectRepository(ResourceLabelEntity)
    private readonly resourceLabelRepository: Repository<ResourceLabelEntity>,
    @InjectRepository(UserFavoriteLabel)
    private readonly userFavoriteLabelRepository: Repository<UserFavoriteLabel>,
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>
  ) {}

  async saveAndList(label: CreateLabel, activityId: string, navigationExerciseId: string): Promise<LabelEntity[]> {
    const labelEntity = await this.labelRepository.save(label)
    const resourceId = await this.getResourceId(activityId, navigationExerciseId)
    await this.resourceLabelRepository.save({ resourceId, labelId: labelEntity.id, navigationExerciseId })
    return this.list(navigationExerciseId)
  }

  async getResourceId(activityId: string, navigationExerciseId: string): Promise<string> {
    const activity = await this.activityRepository.findOne({ where: { id: activityId } })
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${activityId} not found`)
    }
    const resourceId = activity.source?.resource
    if (!resourceId) {
      throw new NotFoundException(`Resource ID not found for activity with ID ${activityId}`)
    }
    const exerciseGroups = Object.values(normalizeExerciseGroups(activity.source?.variables.exerciseGroups))
    for (const group of exerciseGroups) {
      for (const exercise of group.exercises) {
        if (exercise.id === navigationExerciseId) {
          return exercise.resource
        }
      }
    }
    throw new NotFoundException(
      `Navigation exercise with ID ${navigationExerciseId} not found in activity ${activityId}`
    )
  }

  async list(navigationExerciseId: string): Promise<LabelEntity[]> {
    const resourceLabels = await this.resourceLabelRepository.find({
      where: { navigationExerciseId },
      order: { createdAt: 'ASC' },
    })
    const resourceLabelIds = resourceLabels.map((resourceLabel) => resourceLabel.labelId)
    const labels = await this.convertLabelIdsToEntity(resourceLabelIds)
    // const userLabels = await this.getUserFav(userId)
    // const userLabelIds = new Set(userLabels.map((label) => label.id))
    // const uniqueLabels = userLabels.concat(labels.filter((label) => !userLabelIds.has(label.id)))
    return labels
  }

  async findById(id: string): Promise<Optional<LabelEntity>> {
    return Optional.ofNullable(await this.labelRepository.findOne({ where: { id } }))
  }

  async getUserFav(userId: string): Promise<LabelEntity[]> {
    const labelsId = (await this.userFavoriteLabelRepository.find({ where: { userId: userId } })).map((l) => l.labelId)
    return this.convertLabelIdsToEntity(labelsId)
  }

  async favLabel(label: LabelEntity, userId: string): Promise<LabelEntity[]> {
    await this.userFavoriteLabelRepository.save({ userId, labelId: label.id })
    return this.getUserFav(userId)
  }

  async unfavLabel(label: LabelEntity, userId: string): Promise<LabelEntity[]> {
    await this.userFavoriteLabelRepository.delete({ userId, labelId: label.id })
    return this.getUserFav(userId)
  }

  async update(id: string, updates: Partial<LabelEntity>): Promise<LabelEntity> {
    const labelEntity = await this.labelRepository.findOne({ where: { id } })

    if (!labelEntity) {
      throw new NotFoundException(`Label with ID ${id} not found`)
    }

    Object.assign(labelEntity, updates)

    return this.labelRepository.save(labelEntity)
  }

  private async convertLabelIdsToEntity(labelIds: string[]): Promise<LabelEntity[]> {
    return (
      await Promise.all(labelIds.map((labelId) => this.labelRepository.findOne({ where: { id: labelId } })))
    ).filter((label) => label !== undefined) as LabelEntity[]
  }

  async delete(id: string): Promise<boolean> {
    const label = await this.labelRepository.findOne({ where: { id } })
    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`)
    }
    await this.resourceLabelRepository.delete({ labelId: id })
    await this.labelRepository.delete(id)
    return true
  }
}
