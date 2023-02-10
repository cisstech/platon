import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@platon/core/server';
import { CreateResourceMember, ResourceMember, UpdateResourceMember } from '@platon/feature/resource/common';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { MemberPermissionsDTO } from './permissions.dto';

export class ResourceMemberDTO extends BaseDTO implements ResourceMember {
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


export class CreateResourceMemberDTO implements CreateResourceMember {
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}


export class UpdateResourceMemberDTO implements UpdateResourceMember {
  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions?: MemberPermissionsDTO
}
