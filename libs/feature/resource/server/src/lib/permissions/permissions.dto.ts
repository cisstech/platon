import { ApiProperty } from '@nestjs/swagger'
import { MemberPermissions, ResourcePermissions } from '@platon/feature/resource/common'
import { IsBoolean } from 'class-validator'

export class MemberPermissionsDTO implements MemberPermissions {
  @IsBoolean()
  @ApiProperty()
  read!: boolean

  @IsBoolean()
  @ApiProperty()
  write!: boolean
}

export class ResourcePermissionsDTO extends MemberPermissionsDTO implements ResourcePermissions {
  @IsBoolean()
  @ApiProperty()
  watcher!: boolean
}
