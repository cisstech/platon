import { Controller, Get, Param, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, UserRoles } from '@platon/core/common'
import { IRequest, Roles } from '@platon/core/server'
import { DashboardOutput } from '@platon/feature/result/common'
import { DashboardService } from './dashboard.service'

@Controller('results/dashboard')
@ApiTags('Results')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('sessions/:id')
  async ofSession(@Req() req: IRequest, @Param('id') id: string): Promise<DashboardOutput> {
    const [session, output] = await this.service.ofSession(id)
    if (session.userId && req.user?.id !== session.userId) {
      throw new ForbiddenResponse(`You don't have access to this session`)
    }
    return output
  }

  @Roles(UserRoles.admin, UserRoles.teacher)
  @Get('activities/:id')
  ofActivity(@Param('id') id: string): Promise<DashboardOutput> {
    return this.service.ofActivity(id)
  }

  @Roles(UserRoles.admin, UserRoles.teacher)
  @Get('resources/:id')
  ofResource(@Param('id') id: string): Promise<DashboardOutput> {
    return this.service.ofResource(id)
  }
}
