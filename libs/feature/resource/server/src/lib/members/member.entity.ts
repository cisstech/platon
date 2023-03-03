import { BaseEntity, UserEntity } from '@platon/core/server';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { MemberPermissions } from '../permissions';
import { ResourceEntity } from '../resource.entity';


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

  @Column({ name: 'inviter_id' })
  inviterId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviter_id' })
  inviter!: UserEntity

  @Column(() => MemberPermissions)
  permissions!: MemberPermissions
}

