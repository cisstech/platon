import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../database/base-entity';
import { LevelEntity } from '../../levels';
import { TopicEntity } from '../../topics';
import { UserEntity } from '../user.entity';

@Entity('UserPrefs')
export class UserPrefsEntity extends BaseEntity {
  @ManyToMany(() => LevelEntity, {
    eager: true
  })
  @JoinTable({
    name: 'UserLevels',
    joinColumn: {
      name: 'user_prefs_id',
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "level_id",
      referencedColumnName: "id"
    }
  })
  levels!: LevelEntity[]

  @ManyToMany(() => TopicEntity, {
    eager: true
  })
  @JoinTable({
    name: 'UserTopics',
    joinColumn: {
      name: 'user_prefs_id',
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "topic_id",
      referencedColumnName: "id"
    }
  })
  topics!: TopicEntity[]

  @Index('UserPrefs_user_id_idx')
  @Column({ name: 'user_id' })
  userId!: string

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity
}
