import { Controller, Get, Param } from '@nestjs/common';
import { ListResponse, Mapper } from '@platon/core/common';
import { ResourceEventDTO } from '@platon/feature/resource/common';
import { ResourceEventService } from '../services/event.service';

@Controller('resources/:resourceId/events')
export class ResourceEventController {
  constructor(
    private readonly service: ResourceEventService,
  ) { }

  @Get()
  async list(
    @Param('resourceId') resourceId: string,
  ): Promise<ListResponse<ResourceEventDTO>> {
    const [items, total] = await this.service.findAll(resourceId);
    const resources = Mapper.mapAll(items, ResourceEventDTO);
    return new ListResponse({ total, resources })
  }
}
