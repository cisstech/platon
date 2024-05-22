import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseGroupEntity } from './course-group.entity'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { CourseGroupMemberService } from '../course-group-member/course-group-member.service'

@Injectable()
export class CourseGroupService {
  constructor(
    @InjectRepository(CourseGroupEntity)
    private readonly repository: Repository<CourseGroupEntity>,
    private readonly courseGroupMemberService: CourseGroupMemberService
  ) {}

  async listCourseGroups(courseId: string): Promise<CourseGroupEntity[]> {
    return this.repository.find({ where: { courseId }, order: { name: 'ASC' } })
  }

  /**
   * Add a user to a course group if not already present
   * @param groupId group id
   * @param courseId course id
   * @returns the course group
   */
  async addCourseGroup(courseId: string, groupId?: string, name?: string): Promise<CourseGroupEntity> {
    if (!groupId) {
      groupId = uuidv4()
    }
    const existing = await this.repository.findOne({ where: { groupId, courseId } })
    if (existing) {
      return existing
    }
    if (!name) {
      name = 'Groupe ' + ((await this.countCourseGroups(courseId)) + 1)
    }
    return this.repository.save(this.repository.create({ groupId, courseId, name: name }))
  }

  async deleteAllCourseGroups(): Promise<void> {
    await this.repository.delete({})
  }

  async countCourseGroups(courseId: string): Promise<number> {
    return this.repository.count({ where: { courseId } })
  }

  async update(groupId: string, changes: Partial<CourseGroupEntity>): Promise<CourseGroupEntity> {
    const group = await this.repository.findOne({ where: { groupId } })
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`)
    }
    Object.assign(group, changes)
    return this.repository.save(group)
  }

  async delete(groupId: string): Promise<void> {
    await this.repository.delete({ groupId })
  }

  async findById(groupId: string): Promise<CourseGroupEntity | null> {
    return this.repository.findOne({ where: { groupId } })
  }

  async isMember(id: string, userId: string): Promise<boolean> {
    const group = await this.repository.findOne({ where: { id } })
    if (!group) {
      throw new Error(`Group with id ${id} not found`)
    }
    return this.courseGroupMemberService.isMember(group.groupId, userId)
  }
}
