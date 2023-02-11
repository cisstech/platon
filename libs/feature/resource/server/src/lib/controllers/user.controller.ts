import { Body, Controller, Get, Param, Post, Request, UnauthorizedException } from '@nestjs/common';
import { ItemResponse, ListResponse, SuccessResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ResourceDTO } from '../dto/resource.dto';
import { CreateResourceViewDTO } from '../dto/view.dto';
import { ResourceService } from '../services/resource.service';
import { ResourceViewService } from '../services/view.service';

@Controller('user/:username')
export class UserResourceController {
  constructor(
    private readonly viewService: ResourceViewService,
    private readonly resourceService: ResourceService,
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


  @Get('/circle')
  async circle(
    @Param('username') username: string,
    @Request() req: IRequest,
  ): Promise<ItemResponse<ResourceDTO>> {
    if (username !== req.user.username) {
      throw new UnauthorizedException("You cannot access other users' personal circles")
    }

    return new ItemResponse({
      resource: await this.resourceService.findPersonalCircle(req.user.id)
    })
  }

}
