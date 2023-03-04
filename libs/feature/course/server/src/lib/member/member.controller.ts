import { Controller } from '@nestjs/common';
import { CourseMemberService } from './member.service';

@Controller('courses/:courseId/members')
export class CourseMemberController {
  constructor(
    private readonly service: CourseMemberService
  ) { }
}
