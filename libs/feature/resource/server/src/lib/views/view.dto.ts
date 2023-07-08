import { CreateResourceView } from '@platon/feature/resource/common'
import { IsUUID } from 'class-validator'

export class CreateResourceViewDTO implements CreateResourceView {
  @IsUUID()
  resourceId!: string
}
