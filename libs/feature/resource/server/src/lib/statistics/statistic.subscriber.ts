import { Injectable } from '@nestjs/common'
import { DataSource, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm'

const TABLES = ['Resources', 'ResourceMembers', 'ResourceWatchers']

@Injectable()
export class ResourceStatsSubscriber implements EntitySubscriberInterface {
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
      await event.manager.query(`REFRESH MATERIALIZED VIEW "ResourceStats"`)
    }
  }
}
