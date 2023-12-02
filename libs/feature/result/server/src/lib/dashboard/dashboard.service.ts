import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { ResourceTypes } from '@platon/feature/resource/common'
import { ResourceEntity, ResourceService } from '@platon/feature/resource/server'
import { DashboardOutput } from '@platon/feature/result/common'
import { IsNull, Not, Repository } from 'typeorm'
import { SessionView } from '../sessions/session.view'
import { activitySessionAggregators, exerciseSessionAggregators } from './aggregators/session.aggregator'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SessionView)
    private readonly sessionView: Repository<SessionView>,
    private readonly resourceService: ResourceService
  ) {}

  async ofResource(id: string): Promise<DashboardOutput> {
    const resource = (await this.resourceService.findById(id)).orElseThrow(
      () => new NotFoundResponse('Resource not found')
    )

    const output: DashboardOutput = {}

    if (resource.type === ResourceTypes.EXERCISE) {
      await this.ofExerciseResource(resource, output)
    }

    if (resource.type === ResourceTypes.ACTIVITY) {
      await this.ofActivityResource(resource, output)
    }

    return output
  }

  private async ofExerciseResource(resource: ResourceEntity, output: DashboardOutput): Promise<void> {
    const sessions = await this.sessionView.find({
      where: {
        resourceId: resource.id,
        userId: Not(IsNull()),
      },
    })

    const aggregators = exerciseSessionAggregators()
    sessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })
  }

  private async ofActivityResource(resource: ResourceEntity, output: DashboardOutput): Promise<void> {
    const sessions = await this.sessionView.find({
      where: {
        resourceId: resource.id,
        userId: Not(IsNull()),
      },
    })

    const aggregators = activitySessionAggregators()
    sessions.forEach((session) => aggregators.forEach((aggregator) => aggregator.next(session)))
    aggregators.forEach((aggregator) => {
      output[aggregator.id] = aggregator.complete()
    })
  }
}
