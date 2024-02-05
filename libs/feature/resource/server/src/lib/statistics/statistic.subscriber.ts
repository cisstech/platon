import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm'
import { ON_CHANGE_FILE_EVENT, OnChangeFileEventPayload } from '../files/file.event'

const TABLES = ['Resources', 'ResourceMembers', 'ResourceWatchers']

@Injectable()
export class ResourceStatsSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(ResourceStatsSubscriber.name)
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this)
  }

  async afterInsert(event: InsertEvent<unknown>): Promise<void> {
    await this.onEvent(event)
  }

  async afterUpdate(event: InsertEvent<unknown>): Promise<void> {
    await this.onEvent(event)
  }

  async afterRemove(event: RemoveEvent<unknown>): Promise<void> {
    await this.onEvent(event)
  }

  private async onEvent(event: InsertEvent<unknown> | UpdateEvent<unknown> | RemoveEvent<unknown>): Promise<void> {
    if (TABLES.includes(event.metadata.tableName)) {
      console.log('Refreshing materialized view')
      await event.manager.query(`REFRESH MATERIALIZED VIEW "ResourceStats"`)
    }
  }

  @OnEvent(ON_CHANGE_FILE_EVENT)
  protected async onChangeFile(payload: OnChangeFileEventPayload): Promise<void> {
    try {
      this.logger.log('Handling ON_CHANGE_FILE_EVENT: Refreshing stats materialized view')
      await this.dataSource.query(
        `
        UPDATE "Resources"
        SET updated_at = NOW()
        WHERE id = $1
      `,
        [payload.resource.id]
      )
      await this.dataSource.query(`REFRESH MATERIALIZED VIEW "ResourceStats"`)
    } catch (error) {
      this.logger.error('Error handling ON_CHANGE_FILE_EVENT', error)
    }
  }
}
