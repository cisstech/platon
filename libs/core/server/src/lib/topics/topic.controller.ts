import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse } from '@platon/core/common'
import { Mapper, UUIDParam } from '../utils'
import { CreateTopicDTO, TopicDTO, UpdateTopicDTO } from './topic.dto'
import { TopicService } from './topic.service'

@Controller('topics')
@ApiTags('Settings')
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
    const force = input.force || false
    const result = await this.service.create(input, force)
    const resource = {
      ...Mapper.map(result.topic, TopicDTO),
      existing: result.existing,
    }
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async update(@UUIDParam('id') id: string, @Body() input: UpdateTopicDTO): Promise<ItemResponse<TopicDTO>> {
    const resource = Mapper.map(await this.service.update(id, input), TopicDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async delete(@UUIDParam('id') id: string): Promise<NoContentResponse> {
    await this.service.delete(id)
    return new NoContentResponse()
  }
}
