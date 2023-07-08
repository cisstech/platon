import { ApiProperty } from '@nestjs/swagger'
import { BaseDTO, UserDTO } from '@platon/core/server'
import { ActivityMember, CreateActivityMember } from '@platon/feature/course/common'
import { Type } from 'class-transformer'
import { IsOptional, IsUUID } from 'class-validator'
import { CourseMemberDTO } from '../course-member/course-member.dto'

export class ActivityMemberDTO extends BaseDTO implements ActivityMember {
  @IsUUID()
  @ApiProperty()
  readonly activityId!: string

  @IsOptional()
  @Type(() => UserDTO)
  readonly user?: UserDTO

  @Type(() => CourseMemberDTO)
  readonly member!: CourseMemberDTO
}

export class CreateActivityMemberDTO implements CreateActivityMember {
  @IsOptional()
  @IsUUID()
  readonly userId!: string

  @IsUUID()
  readonly memberId!: string
}
