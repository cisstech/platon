import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper } from '@platon/core/server'
import { ActivityCorrectorDTO, CreateActivityCorrectorDTO } from './activity-corrector.dto'
import { ActivityCorrectorService } from './activity-corrector.service'

@Controller('activities/:activityId/correctors')
export class ActivityCorrectorController {
  constructor(private readonly service: ActivityCorrectorService) {}

  @Get()
  async search(@Param('activityId') activityId: string): Promise<ListResponse<ActivityCorrectorDTO>> {
    const [items, total] = await this.service.search(activityId)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityCorrectorDTO),
    })
  }

  @Post()
  async create(
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    const member = await this.service.create(input)
    return new ItemResponse({
      resource: Mapper.map(await this.service.findById(activityId, member.id), ActivityCorrectorDTO),
    })
  }

  @Put()
  async update(
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityCorrectorDTO[]
  ): Promise<ItemResponse<ActivityCorrectorDTO>> {
    await this.service.update(activityId, input)
    return new ItemResponse({
      resource: Mapper.map(await this.service.search(activityId), ActivityCorrectorDTO),
    })
  }

  @Delete('/:activityCorrectorId')
  async delete(
    @Param('activityId') activityId: string,
    @Param('activityCorrectorId') activityCorrectorId: string
  ): Promise<NoContentResponse> {
    await this.service.delete(activityId, activityCorrectorId)
    return new NoContentResponse()
  }
}
