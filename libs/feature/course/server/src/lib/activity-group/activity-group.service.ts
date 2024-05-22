import { Injectable } from '@nestjs/common'
import { ActivityGroupEntity } from './activity-group.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseGroupService } from '../course-group/course-group.service'

@Injectable()
export class ActivityGroupService {
  constructor(
    @InjectRepository(ActivityGroupEntity)
    private readonly repository: Repository<ActivityGroupEntity>,
    private readonly courseGroupService: CourseGroupService
  ) {}

  async create(activityId: string, groupId: string): Promise<ActivityGroupEntity> {
    return this.repository.save(this.repository.create({ activityId, groupId }))
  }

  async delete(activityId: string, groupId: string): Promise<void> {
    await this.repository.delete({ activityId, groupId })
  }

  async search(activityId: string): Promise<ActivityGroupEntity[]> {
    return this.repository.find({ where: { activityId } })
  }

  async update(activityId: string, groupsIds: string[]): Promise<ActivityGroupEntity[]> {
    await this.repository.delete({ activityId })
    return Promise.all(groupsIds.map((groupId) => this.create(activityId, groupId)))
  }

  async isUserInActivityGroup(activityId: string, userId: string): Promise<boolean> {
    const activityGroups = await this.repository.find({ where: { activityId } })

    for (const group of activityGroups) {
      if (await this.courseGroupService.isMember(group.groupId, userId)) {
        return true
      }
    }

    return false
  }

  async numberOfGroups(activityId: string): Promise<number> {
    return this.repository.count({ where: { activityId } })
  }
}
