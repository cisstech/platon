import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { CourseMemberEntity } from './member.entity';

@Injectable()
export class CourseMemberService {
  constructor(
    @InjectRepository(CourseMemberEntity)
    private readonly repository: Repository<CourseMemberEntity>
  ) { }

  async byCourseAndUserId(
    courseId: string,
    userId: string
  ): Promise<Optional<CourseMemberEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { courseId, userId } })
    );
  }

  async ofCourse(courseId: string): Promise<[CourseMemberEntity[], number]> {
    return this.repository.findAndCount({
      where: { courseId }
    });
  }

  async create(member: Partial<CourseMemberEntity>): Promise<CourseMemberEntity> {
    return this.repository.save(member);
  }

  async update(id: string, changes: Partial<CourseMemberEntity>): Promise<CourseMemberEntity> {
    const member = await this.repository.findOne({ where: { id } })
    if (!member) {
      throw new NotFoundResponse(`CourseMember not found: ${id}`)
    }
    Object.assign(member, changes);
    return this.repository.save(member);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
