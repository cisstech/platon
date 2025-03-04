import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { CourseDemoService } from './course-demo.service'
import { IRequest, Mapper, Public, Roles } from '@platon/core/server'
import {
  CreatedResponse,
  ForbiddenResponse,
  ItemResponse,
  NoContentResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common'
import { CourseService } from '../services/course.service'
import { CourseMemberService } from '../course-member/course-member.service'
import {
  CourseDemoAccessAnswerDTO,
  CourseDemoAccessDTO,
  CourseDemoCreateDTO,
  CourseDemoDTO,
  CourseDemoDeleteDTO,
  CourseDemoGetRequestDTO,
  CourseDemoGetResponseDTO,
} from './course-demo.dto'
import { CourseMemberRoles } from '@platon/feature/course/common'

@Controller('courses/demo')
export class CourseDemoController {
  constructor(
    private readonly courseDemoService: CourseDemoService,
    private readonly courseService: CourseService,
    private readonly courseMemberService: CourseMemberService
  ) {}

  @Public()
  @Get('access/:uri')
  async accessDemo(
    @Param() params: CourseDemoAccessDTO,
    @Req() req: IRequest
  ): Promise<ItemResponse<CourseDemoAccessAnswerDTO>> {
    const demo = (await this.courseDemoService.findByUri(params.uri)).orElseThrow(
      () => new NotFoundResponse(`Demo not found: ${params.uri}`)
    )

    if (req.user) {
      if (!(await this.courseMemberService.isMember(demo.course.id, req.user.id))) {
        await this.courseMemberService.addUser(demo.course.id, req.user.id, CourseMemberRoles.student)
      }
      const resource = Mapper.map({ courseId: demo.course.id, auth: false }, CourseDemoAccessAnswerDTO)
      return new ItemResponse({ resource })
    }

    const token = await this.courseDemoService.registerToDemo(demo)
    const resource = Mapper.map({ courseId: demo.course.id, auth: true, ...token }, CourseDemoAccessAnswerDTO)
    return new ItemResponse({ resource })
  }

  @Get(':courseId')
  async getDemo(
    @Req() req: IRequest,
    @Param() params: CourseDemoGetRequestDTO
  ): Promise<ItemResponse<CourseDemoGetResponseDTO>> {
    const demo = (await this.courseDemoService.findByCourseId(params.courseId)).orNull()
    if (!demo) {
      const resource = { demoExists: false }
      return new ItemResponse({ resource })
    }

    if (
      !(await this.courseMemberService.isMember(params.courseId, req.user.id)) &&
      !(req.user.role === UserRoles.admin)
    ) {
      throw new ForbiddenResponse(`You are not a member of this course`)
    }

    const resource = Mapper.map(
      { demoExists: true, demo: { courseId: demo.course.id, uri: demo.id } },
      CourseDemoGetResponseDTO
    )
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async createDemo(@Req() req: IRequest, @Body() body: CourseDemoCreateDTO): Promise<CreatedResponse<CourseDemoDTO>> {
    const optional = await this.courseService.findById(body.courseId)
    const course = optional.orElseThrow(() => new NotFoundResponse(`Course not found: ${body.courseId}`))

    if (!(await this.courseMemberService.hasWritePermission(body.courseId, req.user))) {
      throw new ForbiddenResponse(`You are not allowed to create a demo for this course`)
    }

    if ((await this.courseDemoService.findByCourseId(course.id)).isPresent()) {
      throw new BadRequestException(`A demo already exists for this course`)
    }

    const demo = await this.courseDemoService.create(course)
    const resource = Mapper.map({ courseId: demo.course.id, uri: demo.id }, CourseDemoDTO)

    return new CreatedResponse({ resource })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete(':courseId')
  async deleteDemo(@Req() req: IRequest, @Param() params: CourseDemoDeleteDTO): Promise<NoContentResponse> {
    if (!(await this.courseMemberService.hasWritePermission(params.courseId, req.user))) {
      throw new ForbiddenResponse(`You are not allowed to delete a demo for this course`)
    }

    if ((await this.courseDemoService.findByCourseId(params.courseId)).isEmpty()) {
      throw new BadRequestException(`A demo does not exist yet for this course`)
    }

    await this.courseDemoService.delete(params.courseId)
    return new NoContentResponse()
  }
}
