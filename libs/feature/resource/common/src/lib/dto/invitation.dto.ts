import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@platon/core/common';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { MemberPermissionsDTO } from './permissions.dto';

export class ResourceInvitationDTO extends BaseDTO {
  @IsUUID()
  @ApiProperty()
  inviterId!: string

  @IsUUID()
  @ApiProperty()
  inviteeId!: string

  @IsUUID()
  @ApiProperty()
  resourceId!: string

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}

export class CreateResourceInvitationDTO {
  @IsUUID()
  @ApiProperty()
  inviteeId!: string

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}
