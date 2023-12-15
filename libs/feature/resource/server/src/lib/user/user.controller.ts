import { Expandable } from '@cisstech/nestjs-expand'
import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ItemResponse, ListResponse } from '@platon/core/common'
import { IRequest, Mapper } from '@platon/core/server'
import { ResourceInvitationDTO, ResourceInvitationService } from '../invitations'
import { MemberPermissions } from '../permissions'
import { ResourceDTO } from '../resource.dto'
import { ResourceService } from '../resource.service'

@Controller('users/:username')
@ApiTags('Users')
export class UserResourceController {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly invitationService: ResourceInvitationService
  ) {}

  @Get('/circle')
  @Expandable(ResourceDTO, {
    rootField: 'resource',
  })
  async circle(@Req() req: IRequest, @Param('username') username: string): Promise<ItemResponse<ResourceDTO>> {
    if (username !== req.user.username) {
      throw new UnauthorizedException("You cannot access other users' personal circles")
    }

    const resource = Mapper.map(await this.resourceService.findPersonal(req.user), ResourceDTO)
    const permissions = new MemberPermissions()

    permissions.read = true
    permissions.write = true

    Object.assign(resource, { permissions })

    return new ItemResponse({
      resource,
    })
  }

  @Get('/invitations/resources')
  async invitations(@Req() req: IRequest): Promise<ListResponse<ResourceInvitationDTO>> {
    const [items, total] = await this.invitationService.findAllByInviteeId(req.user.id)
    const resources = Mapper.mapAll(items, ResourceInvitationDTO)
    return new ListResponse({ total, resources })
  }
}
