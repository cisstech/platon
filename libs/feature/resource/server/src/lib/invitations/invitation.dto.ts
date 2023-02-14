import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from '@platon/core/server';
import { CreateResourceInvitation, ResourceInvitation } from '@platon/feature/resource/common';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { MemberPermissionsDTO } from '../members/permissions.dto';

export class ResourceInvitationDTO extends BaseDTO implements ResourceInvitation {
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

export class CreateResourceInvitationDTO implements CreateResourceInvitation {
  @IsUUID()
  @ApiProperty()
  inviteeId!: string

  @Type(() => MemberPermissionsDTO)
  @ApiProperty()
  permissions!: MemberPermissionsDTO
}
