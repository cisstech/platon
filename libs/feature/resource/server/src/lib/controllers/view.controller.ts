import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { CreatedResponse, NoContentResponse, ItemResponse, ListResponse, Mapper } from '@platon/core/common';
import { IRequest } from '@platon/core/server';
import { CreateResourceInvitationDTO, ResourceInvitationDTO, ResourceMemberDTO } from '@platon/feature/resource/common';
import { ResourceInvitationService } from '../services/invitation.service';

@Controller('resources/:resourceId/views')
export class ResourceInvitationController {
  constructor(
    private readonly service: ResourceInvitationService,
  ) { }

  @Get()
  async list(
    @Param('resourceId') resourceId: string,
  ): Promise<ListResponse<ResourceInvitationDTO>> {
    const [items, total] = await this.service.findAll(resourceId);
    const resources = Mapper.mapAll(items, ResourceInvitationDTO);
    return new ListResponse({ total, resources })
  }

  @Post()
  async invite(
    @Request() req: IRequest,
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
    );
    return new ItemResponse({ resource })
  }

  @Patch('/:id')
  async accept(
    @Param('id') id: string,
  ): Promise<CreatedResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.accept(id),
      ResourceMemberDTO
    )
    return new CreatedResponse({ resource })
  }

  @Delete('/:id')
  async decline(
    @Param('id') id: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
