import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { UpdateGroup } from '@platon/feature/course/common'
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

  /** Renames the group `groupId` of the course: its name is all a client may change. */
  async update(courseId: string, groupId: string, changes: UpdateGroup): Promise<CourseGroupEntity> {
    const group = await this.findInCourse(courseId, groupId)
    if (!group) {
      throw new NotFoundResponse(`Group not found in this course: ${groupId}`)
    }
    group.name = changes.name
    return this.repository.save(group)
  }

  async delete(courseId: string, groupId: string): Promise<void> {
    await this.repository.delete({ courseId, groupId })
  }

  async findById(groupId: string): Promise<CourseGroupEntity | null> {
    return this.repository.findOne({ where: { groupId } })
  }

  /** The group `groupId` of the course `courseId`: the identifier of a group is only unique within its course. */
  async findInCourse(courseId: string, groupId: string): Promise<CourseGroupEntity | null> {
    return this.repository.findOne({ where: { courseId, groupId } })
  }

  /** Whether a person is in a group, given by its own id as restrictions name it; a missing group has no one. */
  async isMember(id: string, userId: string): Promise<boolean> {
    const group = await this.repository.findOne({ where: { id } })
    return !!group && this.courseGroupMemberService.isMember(group.groupId, userId)
  }
}
