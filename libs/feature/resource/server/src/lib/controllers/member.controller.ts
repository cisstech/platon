import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { ResourceMemberDTO, UpdateResourceMemberDTO } from '../dto/member.dto';
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
    const [items, total] = await this.service.findAll(resourceId)
    const resources = Mapper.mapAll(items, ResourceMemberDTO)
    return new ListResponse({ total, resources })
  }

  @Patch('/:userId')
  async update(
    @Param('userId') userId: string,
    @Body() input: UpdateResourceMemberDTO
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.updateByUserId(userId, input),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Delete('/:userId')
  async delete(
    @Param('userId') userId: string,
  ): Promise<NoContentResponse> {
    await this.service.deleteByUserId(userId)
    return new NoContentResponse()
  }
}
