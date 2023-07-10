import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SessionCommentEntity } from './comment.entity'

@Injectable()
export class SessionCommentService {
  constructor(
    @InjectRepository(SessionCommentEntity)
    private readonly repository: Repository<SessionCommentEntity>
  ) {}

  async findAll(sessionId: string, answerId: string): Promise<[SessionCommentEntity[], number]> {
    return this.repository.findAndCount({
      where: { sessionId, answerId },
      order: { createdAt: 'ASC' },
    })
  }

  async create(input: Partial<SessionCommentEntity>): Promise<SessionCommentEntity> {
    return this.repository.save(this.repository.create(input))
  }

  async delete(sessionId: string, answerId: string, commentId: string): Promise<void> {
    await this.repository.delete({ sessionId, answerId, id: commentId })
  }
}
