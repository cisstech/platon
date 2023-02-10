import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@platon/core/common';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { MemberPermissionsDTO } from './permissions.dto';

export class ResourceMemberDTO extends BaseDTO {
  @IsUUID()
  @ApiProperty()
  userId!: string

  @IsUUID()
  @ApiProperty()
  resourceId!: string

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}


export class CreateResourceMemberDTO  {
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}


export class UpdateResourceMemberDTO {
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions?: MemberPermissionsDTO
}
