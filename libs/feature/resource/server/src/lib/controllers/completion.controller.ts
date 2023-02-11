import { Controller, Get } from '@nestjs/common';
import { ItemResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { ResourceCompletionDTO } from '../dto';
import { ResourceService } from '../services/resource.service';

@Controller('completion')
export class ResourceCompletionController {
  constructor(
    private readonly service: ResourceService,
  ) { }

  @Get('/resources')
  async resources(
  ): Promise<ItemResponse<ResourceCompletionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.completion(),
        ResourceCompletionDTO
      )
    })
  }

}
