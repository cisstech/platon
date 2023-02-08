import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTopicDTO, DeleteSuccessResponse, DetailSuccessResponse, ListSuccessResponse, Mapper, TopicDTO, UpdateTopicDTO } from '@platon/core/common';
import { TopicService } from './topic.service';

@Controller('topics')
export class TopicController {
  constructor(
    private readonly service: TopicService
  ) { }

  @Get()
  async list(): Promise<ListSuccessResponse<TopicDTO>> {
    const [topics, total] = await this.service.findAndCountAll();
    const resources = Mapper.mapAll(topics, TopicDTO);
    return new ListSuccessResponse({ total, resources })
  }

  @Post()
  async create(
    @Body() input: CreateTopicDTO
  ): Promise<DetailSuccessResponse<TopicDTO>> {
    const resource = Mapper.map(
      await this.service.create(input),
      TopicDTO
    );
    return new DetailSuccessResponse({ resource })
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateTopicDTO
  ): Promise<DetailSuccessResponse<TopicDTO>> {
    const resource = Mapper.map(
      await this.service.update(id, input),
      TopicDTO
    );
    return new DetailSuccessResponse({ resource })
  }

  @Delete('/:id')
  async delete(
    @Param('id') id: string
  ): Promise<DeleteSuccessResponse> {
    await this.service.delete(id);
    return new DeleteSuccessResponse();
  }
}
