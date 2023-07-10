import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper } from '../utils'
import { CreateTopicDTO, TopicDTO, UpdateTopicDTO } from './topic.dto'
import { TopicService } from './topic.service'

@Controller('topics')
export class TopicController {
  constructor(private readonly service: TopicService) {}

  @Get()
  async list(): Promise<ListResponse<TopicDTO>> {
    const [topics, total] = await this.service.findAll()
    const resources = Mapper.mapAll(topics, TopicDTO)
    return new ListResponse({ total, resources })
  }

  @Post()
  async create(@Body() input: CreateTopicDTO): Promise<CreatedResponse<TopicDTO>> {
    const resource = Mapper.map(await this.service.create(input), TopicDTO)
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async update(@Param('id') id: string, @Body() input: UpdateTopicDTO): Promise<ItemResponse<TopicDTO>> {
    const resource = Mapper.map(await this.service.update(id, input), TopicDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
