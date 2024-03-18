import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseGroupMemberEntity } from './course-group-member.entity'
import { Repository } from 'typeorm'

@Injectable()
export class CourseGroupMemberService {
  constructor(
    @InjectRepository(CourseGroupMemberEntity)
    private readonly repository: Repository<CourseGroupMemberEntity>
  ) {}

  async listCourseGroupMembers(): Promise<CourseGroupMemberEntity[]> {
    return this.repository.find()
  }

  /**
   * Add a user to a course group if not already present
   * @param groupId group id
   * @param userId user id
   * @returns the course group
   */
  async addCourseGroupMember(groupId: string, userId: string): Promise<CourseGroupMemberEntity> {
    const existing = await this.repository.findOne({ where: { groupId, userId } })
    if (existing) {
      return existing
    }
    return this.repository.save(this.repository.create({ groupId, userId }))
  }

  async deleteAllCourseGroups(): Promise<void> {
    await this.repository.delete({})
  }
}
