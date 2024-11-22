import { Body, Controller, Delete, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  ErrorResponse,
  ForbiddenResponse,
  ItemResponse,
  ListResponse,
  NoContentResponse,
  UserRoles,
} from '@platon/core/common'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { ResourceMemberDTO, ResourceMemberFiltersDTO, UpdateResourceMemberDTO } from './member.dto'
import { ResourceMemberService } from './member.service'

@Controller('resources/:resourceId/members')
@ApiTags('Resources')
export class ResourceMemberController {
  constructor(private readonly service: ResourceMemberService) {}

  @Get()
  async search(
    @UUIDParam('resourceId') resourceId: string,
    @Query() filters: ResourceMemberFiltersDTO = {}
  ): Promise<ListResponse<ResourceMemberDTO>> {
    const [items, total] = await this.service.search(resourceId, filters)
    const resources = Mapper.mapAll(items, ResourceMemberDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:userId')
  async find(
    @UUIDParam('userId') userId: string,
    @UUIDParam('resourceId') resourceId: string
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const optional = await this.service.findByUserId(resourceId, userId)
    const resource = Mapper.map(
      optional.orElseThrow(
        () =>
          new ErrorResponse({
            status: 404,
            message: `ResourceMember not found: ${userId}`,
          })
      ),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Post()
  async post(
    @Req() req: IRequest,
    @UUIDParam('resourceId') resourceId: string
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        resourceId,
        userId: req.user.id,
        waiting: true,
        inviterId: req.user.id,
        permissions: {
          read: false,
          write: false,
        },
      }),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.admin)
  @Patch('/:userId')
  async update(
    @Req() req: IRequest,
    @UUIDParam('userId') userId: string,
    @UUIDParam('resourceId') resourceId: string,
    @Body() input: UpdateResourceMemberDTO
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.updateByUserId(resourceId, userId, {
        ...input,
        // do not remove the explicit false check here since it's intentional
        ...(input.waiting === false ? { inviterId: req.user!.id } : {}),
      }),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Delete('/:userId')
  async delete(
    @Req() req: IRequest,
    @UUIDParam('userId') userId: string,
    @UUIDParam('resourceId') resourceId: string
  ): Promise<NoContentResponse> {
    if (req.user.id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenResponse('You are not allowed to delete this resource member')
    }
    await this.service.deleteByUserId(resourceId, userId)
    return new NoContentResponse()
  }
}
