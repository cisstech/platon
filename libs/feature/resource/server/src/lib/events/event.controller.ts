import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { ResourceEventDTO } from './event.dto';
import { ResourceEventFiltersDTO } from './event.filter';
import { ResourceEventService } from './event.service';

@Controller('resources/:resourceId/events')
export class ResourceEventController {
  constructor(
    private readonly service: ResourceEventService,
  ) { }

  @Get()
  async search(
    @Param('resourceId') resourceId: string,
    @Query() filters: ResourceEventFiltersDTO = {}
  ): Promise<ListResponse<ResourceEventDTO>> {
    const [items, total] = await this.service.search(resourceId, filters);
    const resources = Mapper.mapAll(items, ResourceEventDTO);
    return new ListResponse({ total, resources })
  }
}
