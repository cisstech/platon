import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { CreatedResponse, ItemResponse, ListResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ResourceCompletionDTO, ResourceFiltersDTO } from '../dto';
import { CircleTreeDTO, CreateResourceDTO, ResourceDTO, UpdateResourceDTO } from '../dto/resource.dto';
import { ResourceService } from '../services/resource.service';
import { ResourceViewService } from '../services/view.service';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly viewService: ResourceViewService,
    private readonly service: ResourceService,
  ) { }

  @Get()
  async search(
    @Request() req: IRequest,
    @Query() filters: ResourceFiltersDTO = {}
  ): Promise<ListResponse<ResourceDTO>> {
    let resources: ResourceDTO[] = [];
    let total = 0;
    if (filters.views) {
      const response = await this.viewService.findAll(req.user.id);
      resources = Mapper.mapAll(response[0].map(r => r.resource), ResourceDTO);
      total = response[1]
    } else {
      const response = await this.service.search(filters);
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
        await this.service.tree(),
        CircleTreeDTO
      )
    })
  }

  @Get('/completion')
  async completion(
  ): Promise<ItemResponse<ResourceCompletionDTO>> {
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.completion(),
        ResourceCompletionDTO
      )
    })
  }

  @Get('/:id')
  async find(
    @Request() req: IRequest,
    @Param('id') id: string,
    @Query('markAsViewed') markAsViewed?: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const optional = await this.service.findById(id);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundException(`Resource not found: ${id}`)),
      ResourceDTO
    );

    if (markAsViewed) {
      this.viewService.create({
        resourceId: id,
        userId: req.user.id,
      })
    }
    return new ItemResponse({ resource })
  }

  @Post()
  async create(
    @Request() req: IRequest,
    @Body() input: CreateResourceDTO
  ): Promise<CreatedResponse<ResourceDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...(await this.service.fromInput(input)),
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
      await this.service.update(id, await this.service.fromInput(input)),
      ResourceDTO
    );
    return new ItemResponse({ resource })
  }

}
