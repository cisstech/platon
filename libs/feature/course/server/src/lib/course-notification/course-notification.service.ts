import { Injectable } from '@nestjs/common';
import { UserGroupService } from '@platon/core/server';
import { CourseMemberCreationNotification } from '@platon/feature/course/common';
import { NotificationService } from '@platon/feature/notification/server';
import { CourseMemberEntity } from '../course-member/course-member.entity';
import { CourseService } from '../course.service';

@Injectable()
export class CourseNotificationService {
  constructor(
    private readonly courseService: CourseService,
    private readonly useGroupService: UserGroupService,
    private readonly notificationService: NotificationService
  ) {}

  async sendMemberCreation(member: CourseMemberEntity) {
    const course = (await this.courseService.findById(member.courseId)).get();

    const userIds: string[] = [];
    if (member.groupId) {
      const users = await this.useGroupService.listMembers(member.groupId);
      userIds.push(...users.map((user) => user.id));
    }

    if (member.userId) {
      userIds.push(member.userId);
    }

    return this.notificationService.sendToAllUsers<CourseMemberCreationNotification>(
      userIds,
      {
        type: 'COURSE-MEMBER-CREATION',
        courseId: course.id,
        courseName: course.name,
      }
    );
  }
}
