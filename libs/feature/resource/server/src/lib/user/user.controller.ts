import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { ItemResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { ResourceDTO } from '../resource.dto';
import { ResourceService } from '../resource.service';

@Controller('users/:username')
export class UserResourceController {
  constructor(
    private readonly resourceService: ResourceService,
  ) { }

  @Get('/circle')
  async circle(
    @Req() req: IRequest,
    @Param('username') username: string,
  ): Promise<ItemResponse<ResourceDTO>> {
    if (username !== req.user.username) {
      throw new UnauthorizedException("You cannot access other users' personal circles")
    }

    return new ItemResponse({
      resource: Mapper.map(
        await this.resourceService.findPersonal(req.user.id),
        ResourceDTO
      )
    })
  }

}
