import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ListResponse } from '@platon/core/common'
import { Mapper } from '@platon/core/server'
import { ResourceEventDTO, ResourceEventFiltersDTO } from './event.dto'
import { ResourceEventService } from './event.service'

@Controller('resources/:resourceId/events')
@ApiTags('Resources')
export class ResourceEventController {
  constructor(private readonly service: ResourceEventService) {}

  @Get()
  async search(
    @Param('resourceId') resourceId: string,
    @Query() filters: ResourceEventFiltersDTO = {}
  ): Promise<ListResponse<ResourceEventDTO>> {
    const [items, total] = await this.service.search(resourceId, filters)
    const resources = Mapper.mapAll(items, ResourceEventDTO)
    return new ListResponse({ total, resources })
  }
}
