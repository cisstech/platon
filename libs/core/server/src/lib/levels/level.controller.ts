import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper, UUIDParam } from '../utils'
import { CreateLevelDTO, LevelDTO, UpdateLevelDTO } from './level.dto'
import { LevelService } from './level.service'
import { Roles } from '../auth/decorators/roles.decorator'

@Controller('levels')
@ApiTags('Settings')
export class LevelController {
  constructor(private readonly service: LevelService) {}

  @Get()
  async list(): Promise<ListResponse<LevelDTO>> {
    const [levels, total] = await this.service.findAll()
    const resources = Mapper.mapAll(levels, LevelDTO)
    return new ListResponse({ total, resources })
  }

  @Post()
  @Roles('admin', 'teacher')
  async create(@Body() input: CreateLevelDTO): Promise<CreatedResponse<LevelDTO>> {
    const force = input.force || false
    const result = await this.service.create(input, force)
    const resource = { ...Mapper.map(result.level, LevelDTO), existing: result.existing }
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  @Roles('admin')
  async update(@UUIDParam('id') id: string, @Body() input: UpdateLevelDTO): Promise<ItemResponse<LevelDTO>> {
    const resource = Mapper.map(await this.service.update(id, input), LevelDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  @Roles('admin')
  async delete(@UUIDParam('id') id: string): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
