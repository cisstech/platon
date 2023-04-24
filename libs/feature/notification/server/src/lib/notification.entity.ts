import { BaseEntity, UserEntity } from '@platon/core/server';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('Notifications')
export class NotificationEntity extends BaseEntity {
  @Index('Notifications_user_id_idx')
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity

  @Index('Notifications_read_at_idx')
  @Column({ name: 'read_at', nullable: true, type: 'timestamp with time zone' })
  readAt?: Date | null

  @Column({ type: 'jsonb' })
  data!: Record<string, unknown>
}
