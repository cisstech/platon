import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common'
import {
  CreatedResponse,
  ItemResponse,
  ListResponse,
  NoContentResponse,
  NotFoundResponse,
  UserRoles,
} from '@platon/core/common'
import { IRequest, Mapper, Roles } from '@platon/core/server'
import { ResourceMemberDTO } from '../members/member.dto'
import { CreateResourceInvitationDTO, ResourceInvitationDTO } from './invitation.dto'
import { ResourceInvitationService } from './invitation.service'

@Controller('resources/:resourceId/invitations')
export class ResourceInvitationController {
  constructor(private readonly service: ResourceInvitationService) {}

  @Get()
  async list(@Param('resourceId') resourceId: string): Promise<ListResponse<ResourceInvitationDTO>> {
    const [items, total] = await this.service.findAll(resourceId)
    const resources = Mapper.mapAll(items, ResourceInvitationDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:inviteeId')
  async find(
    @Param('inviteeId') inviteeId: string,
    @Param('resourceId') resourceId: string
  ): Promise<ItemResponse<ResourceInvitationDTO>> {
    const optional = await this.service.findLastOfInviteeInResource(resourceId, inviteeId)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`ResourceInvitation not found: ${inviteeId}`)),
      ResourceInvitationDTO
    )
    return new ItemResponse({ resource })
  }

  @Roles(UserRoles.admin)
  @Post()
  async invite(
    @Req() req: IRequest,
    @Param('resourceId') resourceId: string,
    @Body() input: CreateResourceInvitationDTO
  ): Promise<ItemResponse<ResourceInvitationDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...input,
        resourceId,
        inviterId: req.user.id,
      }),
      ResourceInvitationDTO
    )
    return new ItemResponse({ resource })
  }

  @Patch('/:inviteeId')
  async accept(
    @Param('inviteeId') inviteeId: string,
    @Param('resourceId') resourceId: string
  ): Promise<CreatedResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(await this.service.accept(resourceId, inviteeId), ResourceMemberDTO)
    return new CreatedResponse({ resource })
  }

  @Roles(UserRoles.admin)
  @Delete('/:inviteeId')
  async decline(
    @Req() req: IRequest,
    @Param('inviteeId') inviteeId: string,
    @Param('resourceId') resourceId: string
  ): Promise<NoContentResponse> {
    await this.service.delete(resourceId, inviteeId)
    return new NoContentResponse()
  }
}
