import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm'

@Entity('DiscordInvitation')
export class DiscordInvitationEntity extends BaseEntity {
  @Index('User_idx', { synchronize: false })
  @Column({ name: 'user_id' })
  userId!: string

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @Index('Invitation_idx', { synchronize: false })
  @Column()
  invitation!: string

  @Column()
  date!: Date
}
