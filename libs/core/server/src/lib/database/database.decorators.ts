import { SetMetadata } from '@nestjs/common'
import { BaseEntity, EntityTarget } from 'typeorm'
import { UserEntity } from '../users'

export const VIRTUAL_COLUMNS_RESOLVER = Symbol('VIRTUAL_COLUMNS_RESOLVER')

export interface VirtualColumnResolver<T extends BaseEntity> {
  resolve(entities: T[], user: UserEntity): Promise<void>
}
export const RegisterVirtualColumnsResolver = (target: EntityTarget<unknown>) =>
  SetMetadata(VIRTUAL_COLUMNS_RESOLVER, target)
