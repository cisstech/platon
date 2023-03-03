import { BaseEntity, UserEntity } from '@platon/core/server';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { MemberPermissions } from '../permissions';
import { ResourceEntity } from '../resource.entity';


@Entity('ResourceInvitations')
@Unique('ResourceInvitations_unique_idx', ['inviterId', 'inviteeId', 'resourceId'])
export class ResourceInvitationEntity extends BaseEntity {
  @Column({ name: 'inviter_id' })
  inviterId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inviter_id' })
  inviter!: UserEntity

  @Column({ name: 'invitee_id' })
  inviteeId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitee_id' })
  invitee!: UserEntity

  @Column({ name: 'resource_id' })
  resourceId!: string

  @ManyToOne(() => ResourceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource!: ResourceEntity

  @Column(() => MemberPermissions)
  permissions!: MemberPermissions
}

