import { UserRoles } from '@platon/core/common';
import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '../../database/base-entity';

@Entity('Users')
@Unique('Users_unique_idx', ['username'])
export class UserEntity extends BaseEntity {
  @Column()
  username!: string

  @Column({ name: 'first_name', default: '' })
  firstName!: string

  @Column({ name: 'last_name', default: '' })
  lastName!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Column({ type: 'enum', enum: UserRoles })
  role!: UserRoles

  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  password?: string

  @Column({ name: 'last_login', nullable: true, type: 'timestamp with time zone' })
  lastLogin?: Date

  @Column({ name: 'first_login', nullable: true, type: 'timestamp with time zone' })
  firstLogin?: Date
}
