import { ApiProperty } from '@nestjs/swagger'
import { MemberPermissions } from '@platon/feature/resource/common'
import { IsBoolean } from 'class-validator'

export class MemberPermissionsDTO implements MemberPermissions {
  @IsBoolean()
  @ApiProperty()
  read!: boolean

  @IsBoolean()
  @ApiProperty()
  write!: boolean
}
