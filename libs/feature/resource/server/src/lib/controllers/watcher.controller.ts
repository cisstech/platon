import { Controller, Delete, Get, NotFoundException, Param, Post, Query, Request, UnauthorizedException } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { IRequest, Mapper, UserDTO } from '@platon/core/server';
import { ResourceWatcherFiltersDTO } from '../dto';
import { ResourceWatcherService } from '../services/watcher.service';

@Controller('resources/:resourceId/watchers')
export class ResourceWatcherController {
  constructor(
    private readonly service: ResourceWatcherService,
  ) { }

  @Get()
  async search(
    @Param('resourceId') resourceId: string,
    @Query() filters: ResourceWatcherFiltersDTO = {}
  ): Promise<ListResponse<UserDTO>> {
    const [items, total] = await this.service.search(resourceId, filters)
    const resources = Mapper.mapAll(items.map(e => e.user), UserDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:userId')
  async find(
    @Param('resourceId') resourceId: string,
    @Param('userId') userId: string,
  ): Promise<ItemResponse<UserDTO>> {
    const optional = await this.service.findByUserId(resourceId, userId);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundException(`ResourceWatcher not found: ${userId}`))?.user,
      UserDTO
    );
    return new ItemResponse({ resource })
  }

  @Post()
  async create(
    @Request() req: IRequest,
    @Param('resourceId') resourceId: string,
  ): Promise<ItemResponse<UserDTO>> {
    const resource = Mapper.map(
      await this.service.create({ userId: req.user.id, resourceId }),
      UserDTO
    )
    return new ItemResponse({ resource })
  }

  @Delete('/:userId')
  async delete(
    @Request() req: IRequest,
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
  ): Promise<NoContentResponse> {
    if (userId !== req.user.id) {
      throw new UnauthorizedException("You cannot access other users' info")
    }

    await this.service.deleteByUserId(resourceId, userId)
    return new NoContentResponse()
  }
}
