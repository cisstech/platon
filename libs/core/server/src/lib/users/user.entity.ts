import { UserRoles } from '@platon/core/common';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../database/base-entity';

@Entity('Users')
export class UserEntity extends BaseEntity {
  @Index('Users_username_idx', { unique: true })
  @Column()
  username!: string

  @Index('Users_first_name_idx')
  @Column({ name: 'first_name', default: '' })
  firstName!: string

  @Index('Users_last_name_idx')
  @Column({ name: 'last_name', default: '' })
  lastName!: string

  @Column({ type: 'boolean', default: true })
  active!: boolean

  @Index('Users_role_idx')
  @Column({ type: 'enum', enum: UserRoles })
  role!: UserRoles

  @Index('Users_email_idx')
  @Column({ nullable: true })
  email?: string

  @Column({ nullable: true })
  password?: string

  @Column({ name: 'last_login', nullable: true, type: 'timestamp with time zone' })
  lastLogin?: Date

  @Column({ name: 'first_login', nullable: true, type: 'timestamp with time zone' })
  firstLogin?: Date
}
