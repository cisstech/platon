import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { CreateSessionComment } from '@platon/feature/result/common';
import { SessionCommentDTO } from './comment.dto';
import { SessionCommentService } from './comment.service';

@Controller('results/session/:sessionId/comments')
export class SessionCommentController {
  constructor(
    private readonly service: SessionCommentService
  ) { }

  @Get('/:answerId')
  async list(
    @Param('sessionId') sessionId: string,
    @Param('answerId') answerId: string
  ): Promise<ListResponse<SessionCommentDTO>> {
    const [items, total] = await this.service.findAll(sessionId, answerId);
    const resources = Mapper.mapAll(items, SessionCommentDTO);
    return new ListResponse({ total, resources })
  }

  @Post('/:answerId')
  async create(
    @Req() req: IRequest,
    @Param('sessionId') sessionId: string,
    @Param('answerId') answerId: string,
    @Body() input: CreateSessionComment
  ): Promise<ItemResponse<SessionCommentDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...input,
        sessionId,
        answerId,
        authorId: req.user.id,
      }),
      SessionCommentDTO
    );
    return new ItemResponse({ resource })
  }


  @Delete('/:answerId/:commentId')
  async delete(
    @Param('sessionId') sessionId: string,
    @Param('answerId') answerId: string,
    @Param('commentId') commentId: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(sessionId, answerId, commentId)
    return new NoContentResponse()
  }
}
