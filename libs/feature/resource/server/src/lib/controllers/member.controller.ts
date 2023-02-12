import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ErrorResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common';
import { Mapper } from '@platon/core/server';
import { ResourceMemberFiltersDTO } from '../dto';
import { ResourceMemberDTO, UpdateResourceMemberDTO } from '../dto/member.dto';
import { ResourceMemberService } from '../services/member.service';

@Controller('resources/:resourceId/members')
export class ResourceMemberController {
  constructor(
    private readonly service: ResourceMemberService,
  ) { }

  @Get()
  async search(
    @Param('resourceId') resourceId: string,
    @Query() filters: ResourceMemberFiltersDTO = {}
  ): Promise<ListResponse<ResourceMemberDTO>> {
    const [items, total] = await this.service.search(resourceId, filters)
    const resources = Mapper.mapAll(items, ResourceMemberDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:userId')
  async find(
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const optional = await this.service.findByUserId(resourceId, userId);
    const resource = Mapper.map(
      optional.orElseThrow(() => new ErrorResponse({
        status: 404,
        message: `ResourceMember not found: ${userId}`,
      })),
      ResourceMemberDTO
    );
    return new ItemResponse({ resource })
  }


  @Patch('/:userId')
  async update(
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
    @Body() input: UpdateResourceMemberDTO
  ): Promise<ItemResponse<ResourceMemberDTO>> {
    const resource = Mapper.map(
      await this.service.updateByUserId(resourceId, userId, input),
      ResourceMemberDTO
    )
    return new ItemResponse({ resource })
  }

  @Delete('/:userId')
  async delete(
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
  ): Promise<NoContentResponse> {
    await this.service.deleteByUserId(resourceId, userId)
    return new NoContentResponse()
  }
}
