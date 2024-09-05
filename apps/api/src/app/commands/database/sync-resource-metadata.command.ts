import { Logger } from '@nestjs/common'
import { ResourceTypes } from '@platon/feature/resource/common'
import { ResourceEntity, ResourceMetadataService } from '@platon/feature/resource/server'
import { Command, CommandRunner } from 'nest-commander'
import { DataSource, EntityManager } from 'typeorm'

@Command({ name: 'sync-resource-metadatas', description: 'Sync database with resources source infos' })
export class SyncResourceMetadatasCommand extends CommandRunner {
  private readonly logger = new Logger(SyncResourceMetadatasCommand.name)

  constructor(private readonly dataSource: DataSource, private readonly metadataService: ResourceMetadataService) {
    super()
  }

  public async run(): Promise<void> {
    await this.dataSource.transaction(async (entityManager) => {
      this.logger.log('Searching for resources to sync...')

      const resources = await this.dataSource.getRepository(ResourceEntity).find()

      await this.syncCircles(entityManager, resources)
      await this.syncExercises(entityManager, resources)
      await this.syncActivities(entityManager, resources)
    })
  }

  private async syncCircles(entityManager: EntityManager, resources: ResourceEntity[]): Promise<void> {
    const circles = resources.filter((resource) => resource.type === ResourceTypes.CIRCLE)

    this.logger.log(`Syncing ${circles.length} circles...`)

    await Promise.all(
      circles.map(async (circle) => {
        try {
          await this.metadataService.syncCircle({ resource: circle, entityManager })
        } catch (error) {
          this.logger.error(`Unable to sync circle ${circle.id}`, error)
        }
      })
    )

    this.logger.log(`Synced ${circles.length} circles`)
  }
  private async syncActivities(entityManager: EntityManager, resources: ResourceEntity[]): Promise<void> {
    const activities = resources.filter((resource) => resource.type === ResourceTypes.ACTIVITY)

    this.logger.log(`Syncing ${activities.length} activities...`)

    await Promise.all(
      activities.map(async (activity) => {
        try {
          await this.metadataService.syncActivity({ resource: activity, entityManager })
        } catch (error) {
          this.logger.error(`Unable to sync activity ${activity.id}`, error)
        }
      })
    )

    this.logger.log(`Synced ${activities.length} activities`)
  }

  private async syncExercises(entityManager: EntityManager, resources: ResourceEntity[]): Promise<void> {
    const exercises = resources.filter((resource) => resource.type === ResourceTypes.EXERCISE)

    this.logger.log(`Syncing ${exercises.length} exercises...`)

    await Promise.all(
      exercises.map(async (exercise) => {
        try {
          await this.metadataService.syncExercise({ resource: exercise, entityManager })
        } catch (error) {
          this.logger.error(`Unable to sync exercise ${exercise.id}`, error)
        }
      })
    )

    this.logger.log(`Synced ${exercises.length} exercises`)
  }
}
