import { Column } from "typeorm"

export class MemberPermissions {
  @Column({ type: 'boolean', default: true })
  read!: boolean
  @Column({ type: 'boolean', default: true })
  write!: boolean
}
