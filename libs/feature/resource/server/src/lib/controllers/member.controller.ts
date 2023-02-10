import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { IRequest, Mapper } from '@platon/core/server';
import { CreateResourceMemberDTO, ResourceMemberDTO, UpdateResourceMemberDTO } from '../dto/member.dto';
import { ResourceMemberService } from '../services/member.service';

@Controller('resources/:resourceId/members')
export class ResourceMemberController {
  constructor(
    private readonly service: ResourceMemberService,
  ) { }

  @Get()
  async list(
    @Param('resourceId') resourceId: string,
  ): Promise<ListResponse<ResourceMemberDTO>> {
    const [items, total] = await this.service.findAndCountAll(resourceId)
    const resources = Mapper.mapAll(items, ResourceMemberDTO)
    return new ListResponse({ total, resources })
  }

  @Post()
  async create(
    @Request() req: IRequest,
    @Param('resourceId') resourceId: string,
    @Body() input: CreateResourceMemberDTO
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...input,
        resourceId,
        userId: req.user.id
      }),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateResourceMemberDTO
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.update(id, input),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async delete(
    @Param('id') id: string,
  ): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
