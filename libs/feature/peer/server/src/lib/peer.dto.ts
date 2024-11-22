import { IsObject, IsUUID } from 'class-validator'
import { PeerOutput } from '@platon/feature/peer/common'
import { Answer } from '@platon/feature/result/common'

export class PeerOutputDTO implements PeerOutput {
  @IsUUID()
  id!: string

  @IsObject()
  answer1!: Answer

  @IsObject()
  answer2!: Answer
}
