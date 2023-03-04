import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse } from '@platon/core/common';
import { DataSource, Repository, MoreThanOrEqual, And, MoreThan, LessThanOrEqual, LessThan, Not } from 'typeorm';
import { CourseSectionEntity } from './section.entity';

@Injectable()
export class CourseSectionService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(CourseSectionEntity)
    private readonly repository: Repository<CourseSectionEntity>
  ) { }

  async ofCourse(courseId: string): Promise<[CourseSectionEntity[], number]> {
    return this.repository.findAndCount({
      where: { courseId },
      order: {
        order: { direction: 'ASC' }
      }
    });
  }

  async create(section: CourseSectionEntity): Promise<CourseSectionEntity> {
    return this.dataSource.transaction(async (manager) => {
      const after = await manager.find(CourseSectionEntity, {
        where: {
          courseId: section.courseId,
          order: MoreThanOrEqual(section.order || 0)
        }
      });
      after.forEach(s => { s.order++; });
      await manager.save(after);
      return manager.save(
        manager.create(CourseSectionEntity, section)
      );
    });
  }

  async update(
    courseId: string,
    sectionId: string,
    changes: Partial<CourseSectionEntity>
  ): Promise<CourseSectionEntity> {
    return this.dataSource.transaction(async (manager) => {
      const section = await manager.findOne(
        CourseSectionEntity, {
          where: { courseId, id: sectionId }
      });

      if (!section) {
        throw new NotFoundResponse(`CourseSection not found: ${sectionId}`)
      }

      if (changes.order != null && section.order !== changes.order) {
        if (changes.order > section.order) {
          const up = await manager.find(CourseSectionEntity, {
            where: { courseId, order: And(MoreThan(section.order), LessThanOrEqual(changes.order)) }
          });
          up.forEach(s => s.order--);
          await manager.save(up);
        } else {
          const down = await manager.find(CourseSectionEntity, {
            where: { courseId, order: And(MoreThanOrEqual(changes.order), LessThan(section.order)) }
          });
          down.forEach(s => s.order++);
          await manager.save(down);
        }
      }

      Object.assign(section, changes);
      return manager.save(section);
    });
  }

  async delete(courseId: string, sectionId: string) {
    return this.dataSource.transaction(async (manager) => {
      const section = await manager.findOne(
        CourseSectionEntity, {
          where: { courseId, id: sectionId }
      });

      if (!section) {
        throw new NotFoundResponse(`CourseSection not found: ${sectionId}`)
      }

      const others = await manager.find(CourseSectionEntity, {
        where: { courseId, id: Not(sectionId) },
        order: { order: { direction: 'ASC' }}
      });

      others.forEach((s, i) => {
        s.order = i;
      });

      if (others.length) {
        await manager.save(others);
      }

      return manager.remove(section);
    });
  }
}
