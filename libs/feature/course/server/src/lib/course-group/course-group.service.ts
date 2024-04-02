import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseGroupEntity } from './course-group.entity'
import { Repository } from 'typeorm'

@Injectable()
export class CourseGroupService {
  constructor(
    @InjectRepository(CourseGroupEntity)
    private readonly repository: Repository<CourseGroupEntity>
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
  async addCourseGroup(groupId: string, courseId: string, name?: string): Promise<CourseGroupEntity> {
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
}
