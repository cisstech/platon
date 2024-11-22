import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MemberPermissions } from '../permissions'
import { ResourceEntity } from '../resource.entity'

@Entity('ResourceMembers')
@Unique('ResourceMembers_unique_idx', ['userId', 'resourceId'])
export class ResourceMemberEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column({ name: 'inviter_id', default: '00000000-0000-0000-0000-000000000000' })
  inviterId!: string

  // @ts-expect-error: SET DEFAULT does not exist in OnDeleteType
  @ManyToOne(() => UserEntity, { onDelete: 'SET DEFAULT' })
  @JoinColumn({ name: 'inviter_id' })
  inviter!: UserEntity

  @Column({ type: 'boolean', name: 'waiting', default: false })
  waiting!: boolean

  @Column(() => MemberPermissions)
  permissions!: MemberPermissions
}
