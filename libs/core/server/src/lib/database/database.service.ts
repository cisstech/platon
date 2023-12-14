/* eslint-disable @typescript-eslint/no-explicit-any */
import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { BaseEntity, EntityTarget } from 'typeorm'
import { UserEntity } from '../users'
import { VIRTUAL_COLUMNS_RESOLVER, VirtualColumnResolver } from './database.decorators'

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly resolvers = new Map<EntityTarget<unknown>, VirtualColumnResolver<any>>()

  constructor(private readonly discovery: DiscoveryService) {}

  async onModuleInit(): Promise<void> {
    const providers = await this.discovery.providersWithMetaAtKey<EntityTarget<unknown>>(VIRTUAL_COLUMNS_RESOLVER)
    providers.forEach((provider) => {
      const resolver = provider.discoveredClass.instance as VirtualColumnResolver<any>
      this.resolvers.set(provider.meta, resolver)
    })
  }

  async resolveVirtualColumns<T extends BaseEntity>(
    target: EntityTarget<unknown>,
    entities: T[],
    user: UserEntity
  ): Promise<void> {
    const resolver = this.resolvers.get(target)
    if (resolver) {
      await resolver.resolve(entities, user)
    }
  }
}
