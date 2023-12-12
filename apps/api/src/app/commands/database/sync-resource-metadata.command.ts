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
      await this.syncExercises(entityManager)
      await this.syncActivities(entityManager)
    })
  }

  private async syncActivities(entityManager: EntityManager): Promise<void> {
    this.logger.log('Searching for activities to sync...')

    const activities = await this.dataSource
      .getRepository(ResourceEntity)
      .find({ where: { type: ResourceTypes.ACTIVITY } })

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

  private async syncExercises(entityManager: EntityManager): Promise<void> {
    this.logger.log('Searching for exercises to sync...')

    const exercises = await this.dataSource
      .getRepository(ResourceEntity)
      .find({ where: { type: ResourceTypes.EXERCISE } })

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
