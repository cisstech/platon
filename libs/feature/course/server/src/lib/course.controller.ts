import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  CreatedResponse,
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common';
import { IRequest, Mapper, Roles, Public } from '@platon/core/server';
import { CourseMemberService } from './course-member/course-member.service';
import {
  CourseDTO,
  CourseFiltersDTO,
  CreateCourseDTO,
  UpdateCourseDTO,
} from './course.dto';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseMemberService: CourseMemberService
  ) {}

  @Get()
  async search(
    @Req() req: IRequest,
    @Query() filters: CourseFiltersDTO = {}
  ): Promise<ListResponse<CourseDTO>> {
    filters = {
      ...filters,
      members: Array.from(new Set([req.user.id, ...(filters.members || [])])),
    };

    const [items, total] = await this.courseService.search(filters);
    const resources = Mapper.mapAll(items, CourseDTO);
    return new ListResponse({ total, resources });
  }

  @Get('/:id')
  async find(
    @Req() req: IRequest,
    @Param('id') id: string
  ): Promise<ItemResponse<CourseDTO>> {
    const optional = await this.courseService.findById(id);
    const resource = Mapper.map(
      optional.orElseThrow(
        () => new NotFoundResponse(`Course not found: ${id}`)
      ),
      CourseDTO
    );

    if (!(await this.courseMemberService.isMember(id, req.user.id))) {
      throw new ForbiddenResponse(`You are not a member of this course`);
    }

    return new ItemResponse({ resource });
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @Body() input: CreateCourseDTO
  ): Promise<CreatedResponse<CourseDTO>> {
    const resource = Mapper.map(
      await this.courseService.create({
        ...input,
        ownerId: req.user.id,
      }),
      CourseDTO
    );
    return new CreatedResponse({ resource });
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Patch('/:id')
  async update(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body() input: UpdateCourseDTO
  ): Promise<ItemResponse<CourseDTO>> {
    if (!(await this.courseMemberService.isMember(id, req.user.id))) {
      throw new ForbiddenResponse(`You are not a member of this course`);
    }
    const resource = Mapper.map(
      await this.courseService.update(id, input),
      CourseDTO
    );
    return new ItemResponse({ resource });
  }
}
