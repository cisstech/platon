import { Controller, Get, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ListResponse } from '@platon/core/common'
import { IRequest, Mapper } from '@platon/core/server'
import { PlayableActivityDTO, RecentCopyDTO, TaughtActivityDTO } from './home.dto'
import { HomeService } from './home.service'

/** What the homes show of the requesting person, whatever their role: only their own data. */
@ApiBearerAuth()
@Controller()
@ApiTags('Results')
export class HomeController {
  constructor(private readonly service: HomeService) {}

  @Get('activities/mine')
  async playableActivities(@Req() req: IRequest): Promise<ListResponse<PlayableActivityDTO>> {
    const resources = Mapper.mapAll(await this.service.playableActivities(req.user.id), PlayableActivityDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Get('activities/taught')
  async taughtActivities(@Req() req: IRequest): Promise<ListResponse<TaughtActivityDTO>> {
    const resources = Mapper.mapAll(await this.service.taughtActivities(req.user.id), TaughtActivityDTO)
    return new ListResponse({ total: resources.length, resources })
  }

  @Get('results/recent')
  async recentCopies(@Req() req: IRequest): Promise<ListResponse<RecentCopyDTO>> {
    const resources = Mapper.mapAll(await this.service.recentCopies(req.user.id), RecentCopyDTO)
    return new ListResponse({ total: resources.length, resources })
  }
}
