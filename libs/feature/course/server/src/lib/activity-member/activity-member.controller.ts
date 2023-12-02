import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse, NoContentResponse, UserRoles } from '@platon/core/common'
import { Mapper, Roles } from '@platon/core/server'
import { ActivityMemberDTO, CreateActivityMemberDTO } from './activity-member.dto'
import { ActivityMemberService } from './activity-member.service'

@Controller('activities/:activityId/members')
@ApiTags('Courses')
export class ActivityMemberController {
  constructor(private readonly service: ActivityMemberService) {}

  @Get()
  async search(@Param('activityId') activityId: string): Promise<ListResponse<ActivityMemberDTO>> {
    const [items, total] = await this.service.search(activityId)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, ActivityMemberDTO),
    })
  }

  // TODO: check user membership for write operations

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Post()
  async create(
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityMemberDTO
  ): Promise<ItemResponse<ActivityMemberDTO>> {
    const member = await this.service.create(input)
    return new ItemResponse({
      resource: Mapper.map(await this.service.findById(activityId, member.id), ActivityMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Put()
  async update(
    @Param('activityId') activityId: string,
    @Body() input: CreateActivityMemberDTO[]
  ): Promise<ItemResponse<ActivityMemberDTO>> {
    await this.service.update(activityId, input)
    return new ItemResponse({
      resource: Mapper.map(await this.service.search(activityId), ActivityMemberDTO),
    })
  }

  @Roles(UserRoles.teacher, UserRoles.admin)
  @Delete('/:activityMemberId')
  async delete(
    @Param('activityId') activityId: string,
    @Param('activityMemberId') activityMemberId: string
  ): Promise<NoContentResponse> {
    await this.service.delete(activityId, activityMemberId)
    return new NoContentResponse()
  }
}
