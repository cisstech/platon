import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper } from '../utils'
import { CreateLevelDTO, LevelDTO, UpdateLevelDTO } from './level.dto'
import { LevelService } from './level.service'

@Controller('levels')
export class LevelController {
  constructor(private readonly service: LevelService) {}

  @Get()
  async list(): Promise<ListResponse<LevelDTO>> {
    const [levels, total] = await this.service.findAll()
    const resources = Mapper.mapAll(levels, LevelDTO)
    return new ListResponse({ total, resources })
  }

  @Post()
  async create(@Body() input: CreateLevelDTO): Promise<CreatedResponse<LevelDTO>> {
    const resource = Mapper.map(await this.service.create(input), LevelDTO)
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() input: UpdateLevelDTO): Promise<ItemResponse<LevelDTO>> {
    const resource = Mapper.map(await this.service.update(id, input), LevelDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
