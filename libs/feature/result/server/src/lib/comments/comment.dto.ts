import { BaseDTO } from '@platon/core/server'
import { CreateSessionComment, SessionComment } from '@platon/feature/result/common'
import { IsString, IsUUID } from 'class-validator'

export class SessionCommentDTO extends BaseDTO implements SessionComment {
  @IsUUID()
  authorId!: string

  @IsUUID()
  sessionId!: string

  @IsUUID()
  answerId!: string

  @IsString()
  comment!: string
}

export class CreateSessionCommentDTO implements CreateSessionComment {
  @IsString()
  comment!: string
}
