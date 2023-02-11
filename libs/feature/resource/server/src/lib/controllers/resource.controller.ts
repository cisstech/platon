import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Request } from '@nestjs/common';
import { CreatedResponse, ItemResponse, ListResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ResourceFiltersDTO } from '../dto';
import { CreateResourceDTO, ResourceDTO, UpdateResourceDTO } from '../dto/resource.dto';
import { ResourceService } from '../services/resource.service';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly service: ResourceService,
  ) { }

  @Get()
  async list(
    @Query() filters: ResourceFiltersDTO = {}
  ): Promise<ListResponse<ResourceDTO>> {
    console.log(filters)
    const [items, total] = await this.service.findAll();
    const resources = Mapper.mapAll(items, ResourceDTO);
    return new ListResponse({ total, resources })
  }

  @Get('/:id')
  async find(
    @Param('id') id: string
  ): Promise<ItemResponse<ResourceDTO>> {
    const optional = await this.service.findById(id);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundException(`Resource not found: ${id}`)),
      ResourceDTO
    );
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
