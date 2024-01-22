import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper } from '../../utils'
import { CreateUserGroupDTO, UpdateUserGroupDTO, UserGroupDTO, UserGroupFiltersDTO } from './user-group.dto'
import { UserGroupService } from './user-group.service'
import { Roles } from '../../auth/decorators/roles.decorator'

@Controller('user-groups')
@ApiTags('Users')
export class UserGroupController {
  constructor(private readonly service: UserGroupService) {}

  @Get()
  async list(@Query() filters: UserGroupFiltersDTO = {}): Promise<ListResponse<UserGroupDTO>> {
    const [items, total] = await this.service.search(filters)
    return new ListResponse({
      total,
      resources: Mapper.mapAll(items, UserGroupDTO),
    })
  }

  @Roles('admin')
  @Post()
  async create(@Body() input: CreateUserGroupDTO): Promise<CreatedResponse<UserGroupDTO>> {
    const resource = Mapper.map(
      await this.service.create({
        ...(await this.service.fromInput(input)),
      }),
      UserGroupDTO
    )
    return new CreatedResponse({ resource })
  }

  @Roles('admin')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() input: UpdateUserGroupDTO): Promise<ItemResponse<UserGroupDTO>> {
    const resource = Mapper.map(await this.service.update(id, await this.service.fromInput(input)), UserGroupDTO)
    return new ItemResponse({ resource })
  }

  @Roles('admin')
  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
