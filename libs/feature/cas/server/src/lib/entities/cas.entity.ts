import { BaseEntity } from '@platon/core/server'
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'
import { CasVersions } from '@platon/feature/cas/common'
import { LmsEntity } from '@platon/feature/lti/server'

@Entity('Cas')
export class CasEntity extends BaseEntity {
  @Column({ name: 'name', unique: true, nullable: false })
  name!: string

  @Column({ name: 'login_url', unique: true, nullable: false })
  loginURL!: string

  @Column({ name: 'service_validate_url', unique: true, nullable: false })
  serviceValidateURL!: string

  @Column({ name: 'version', type: 'enum', enum: CasVersions, nullable: false, default: CasVersions.V3 })
  version!: CasVersions

  @ManyToMany(() => LmsEntity)
  @JoinTable()
  lmses!: LmsEntity[]
}
