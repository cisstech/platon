import { Controller, Get, Param, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ForbiddenResponse, UserRoles } from '@platon/core/common'
import { IRequest, Roles, UUIDParam } from '@platon/core/server'
import { DashboardOutput, UserActivityResultsDistribution } from '@platon/feature/result/common'
import { DashboardService } from './dashboard.service'

@Controller('results/dashboard')
@ApiTags('Results')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  async ofUser(@Req() req: IRequest): Promise<DashboardOutput> {
    return this.service.ofUser(req.user)
  }

  @Get('sessions/:id')
  async ofSession(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<DashboardOutput> {
    const [session, output] = await this.service.ofSession(id)
    if (session.userId && req.user?.id !== session.userId) {
      throw new ForbiddenResponse(`You don't have access to this session`)
    }
    return output
  }

  @Roles(UserRoles.admin, UserRoles.teacher)
  @Get('activities/:id')
  ofActivity(@UUIDParam('id') id: string): Promise<DashboardOutput> {
    return this.service.ofActivity(id)
  }

  @Roles(UserRoles.admin, UserRoles.teacher)
  @Get('activities/:id/:start_date/:end_date')
  ofActivityForDate(
    @Param('id') id: string,
    @Param('start_date') startDate: number,
    @Param('end_date') endDate: number
  ): Promise<UserActivityResultsDistribution[]> {
    return this.service.ofActivityForDate(id, new Date(startDate), new Date(endDate))
  }

  @Roles(UserRoles.admin, UserRoles.teacher)
  @Get('resources/:id')
  ofResource(@UUIDParam('id') id: string): Promise<DashboardOutput> {
    return this.service.ofResource(id)
  }
}
