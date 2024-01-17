/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseEntity, UserEntity } from '@platon/core/server'
import { Correction } from '@platon/feature/result/common'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('Corrections')
export class CorrectionEntity extends BaseEntity implements Correction {
  @Column({ name: 'author_id' })
  authorId!: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity

  @Column({ type: 'float' })
  grade!: number
}
