import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request } from '@nestjs/common';
import { CreatedResponse, ItemResponse, ListResponse, Mapper } from '@platon/core/common';
import { IRequest } from '@platon/core/server';
import { CreateResourceDTO, ResourceDTO, UpdateResourceDTO } from '@platon/feature/resource/common';
import { ResourceService } from '../services/resource.service';

@Controller('resources')
export class ResourceController {
  constructor(
    private readonly service: ResourceService,
  ) { }

  @Get()
  async list(): Promise<ListResponse<ResourceDTO>> {
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
