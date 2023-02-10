import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ListResponse, Mapper, SuccessResponse } from '@platon/core/common';
import { IRequest } from '@platon/core/server';
import { CreateResourceViewDTO, ResourceDTO } from '@platon/feature/resource/common';
import { ResourceViewService } from '../services/view.service';

@Controller('users/:username')
export class UserResourceController {
  constructor(
    private readonly viewService: ResourceViewService,
  ) { }

  @Get('/resource-views')
  async recentlyViewed(
    @Request() req: IRequest,
  ): Promise<ListResponse<ResourceDTO>> {
    const [items, total] = await this.viewService.findAll(req.user.id)
    const resources = Mapper.mapAll(items.map(item => item.resource), ResourceDTO)
    return new ListResponse({ total, resources })
  }

  @Post('/resource-views')
  async markAsViewed(
    @Request() req: IRequest,
    @Body() input: CreateResourceViewDTO
  ): Promise<SuccessResponse> {
    await this.viewService.create({
      resourceId: input.resourceId,
      userId: req.user.id
    })
    return new SuccessResponse()
  }
}
