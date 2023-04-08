import { Logger } from '@nestjs/common'
import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { CourseEntity } from './course.entity';
import { CourseMemberEntity } from './course-member/course-member.entity';

@Injectable()
export class CourseSubscriber implements EntitySubscriberInterface<CourseEntity> {
  protected readonly logger: Logger;

  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.dataSource.subscribers.push(this);
    this.logger = new Logger(this.constructor.name)
    this.logger.debug(`init: ${this.constructor.name}`)
  }

  listenTo() {
    return CourseEntity;
  }

  async afterInsert(event: InsertEvent<CourseEntity>): Promise<void> {
    this.logger.log(`Set owner ${event.entity.ownerId} as member of course ${event.entity.id}`);
    await event.manager.save(
      event.manager.create(CourseMemberEntity, {
        userId: event.entity.ownerId,
        courseId: event.entity.id,
      })
    );
  }
}
