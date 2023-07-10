/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('Corrections')
export class CorrectionEntity extends BaseEntity {
  @Column({ name: 'author_id' })
  authorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity

  @Column({ type: 'float' })
  grade!: number
}
