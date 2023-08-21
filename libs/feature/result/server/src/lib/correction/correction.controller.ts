import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { IRequest, Mapper } from '@platon/core/server'
import { ActivityCorrection, UpsertCorrection } from '@platon/feature/result/common'
import { CorrectionDTO, PendingCorrectionDTO } from './correction.dto'
import { CorrectionService } from './correction.service'

@Controller('results/corrections')
export class CorrectionController {
  constructor(private readonly service: CorrectionService) {}

  @Get()
  async list(@Req() req: IRequest): Promise<ListResponse<ActivityCorrection>> {
    const items = await this.service.list(req.user.id)
    const resources = Mapper.mapAll(items, PendingCorrectionDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Get('/:activityId')
  async find(@Req() req: IRequest, @Param('activityId') activityId: string): Promise<ListResponse<ActivityCorrection>> {
    const items = await this.service.list(req.user.id, activityId)
    const resources = Mapper.mapAll(items, PendingCorrectionDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Post('/:sessionId')
  async upsert(
    @Req() req: IRequest,
    @Param('sessionId') sessionId: string,
    @Body() input: UpsertCorrection
  ): Promise<ItemResponse<CorrectionDTO>> {
    return new ItemResponse({
      resource: await this.service.upsert(sessionId, {
        ...input,
        authorId: req.user.id,
      }),
    })
  }
}
