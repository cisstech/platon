import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { CreatedResponse, ItemResponse, ListResponse, NotFoundResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ResourceCompletionDTO } from './completion';
import { CircleTreeDTO, CreateResourceDTO, ResourceDTO, ResourceFiltersDTO, UpdateResourceDTO } from './resource.dto';
import { ResourceService } from './resource.service';
import { ResourceStatisticDTO } from './statistics';
import { ResourceViewService } from './views/view.service';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly resourceViewService: ResourceViewService,
  ) { }


  @Get()
  async search(
    @Req() req: IRequest,
    @Query() filters: ResourceFiltersDTO = {}
  ): Promise<ListResponse<ResourceDTO>> {
    let resources: ResourceDTO[] = [];
    let total = 0;
    if (filters.views) {
      const response = await this.resourceViewService.findAll(req.user.id);
      resources = Mapper.mapAll(response[0].map(r => r.resource), ResourceDTO);
      total = response[1]
    } else {
      const response = await this.resourceService.search(filters);
      resources = Mapper.mapAll(response[0], ResourceDTO);
      total = response[1]
    }
    return new ListResponse({ total, resources })
  }

  @Get('/tree')
  async tree(
  ): Promise<ItemResponse<CircleTreeDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.resourceService.tree(),
        CircleTreeDTO
      )
    })
  }

  @Get('/completion')
  async completion(
  ): Promise<ItemResponse<ResourceCompletionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.resourceService.completion(),
        ResourceCompletionDTO
      )
    })
  }

  @Get('/:id')
  async find(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Query('markAsViewed') markAsViewed?: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const optional = await this.resourceService.findById(id);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Resource not found: ${id}`)),
      ResourceDTO
    );

    if (markAsViewed) {
      this.resourceViewService.create({
        resourceId: id,
        userId: req.user.id,
      })
    }

    return new ItemResponse({ resource })
  }

  @Get('/:id/statistic')
  async statistic(
    @Param('id') id: string,
  ): Promise<ItemResponse<ResourceStatisticDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.resourceService.statistic(id),
        ResourceStatisticDTO
      )
    })
  }

  @Post()
  async create(
    @Req() req: IRequest,
    @Body() input: CreateResourceDTO
  ): Promise<CreatedResponse<ResourceDTO>> {
    const resource = Mapper.map(
      await this.resourceService.create({
        ...(await this.resourceService.fromInput(input)),
        ownerId: req.user.id
      }),
      ResourceDTO
    );
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateResourceDTO
  ): Promise<ItemResponse<ResourceDTO>> {
    const resource = Mapper.map(
      await this.resourceService.update(id, await this.resourceService.fromInput(input)),
      ResourceDTO
    );
    return new ItemResponse({ resource })
  }
}
