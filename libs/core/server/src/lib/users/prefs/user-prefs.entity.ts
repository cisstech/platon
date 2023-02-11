import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base-entity';
import { LevelEntity } from '../../levels';
import { TopicEntity } from '../../topics';
import { UserEntity } from '../user.entity';

@Entity('UserPrefs')
export class UserPrefsEntity extends BaseEntity {
  @ManyToMany(() => LevelEntity, {
    eager: true
  })
  @JoinTable()
  levels!: LevelEntity[]

  @ManyToMany(() => TopicEntity, {
    eager: true
  })
  @JoinTable()
  topics!: TopicEntity[]

  @Column({ name: 'user_id' })
  userId!: string

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity
}
