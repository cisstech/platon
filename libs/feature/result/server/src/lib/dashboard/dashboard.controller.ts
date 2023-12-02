import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DashboardOutput } from '@platon/feature/result/common'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
@ApiTags('Results')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('resources/:id')
  ofResource(@Param('id') id: string): Promise<DashboardOutput> {
    return this.service.ofResource(id)
  }
}
