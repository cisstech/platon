import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLevelDTO, DeleteSuccessResponse, DetailSuccessResponse, LevelDTO, ListSuccessResponse, Mapper, UpdateLevelDTO } from '@platon/core/common';
import { LevelService } from './level.service';

@Controller('levels')
export class LevelController {
  constructor(
    private readonly service: LevelService
  ) { }

  @Get()
  async list(): Promise<ListSuccessResponse<LevelDTO>> {
    const [levels, total] = await this.service.findAndCountAll();
    const resources = Mapper.mapAll(levels, LevelDTO);
    return new ListSuccessResponse({ total, resources })
  }

  @Post()
  async create(
    @Body() input: CreateLevelDTO
  ): Promise<DetailSuccessResponse<LevelDTO>> {
    const resource = Mapper.map(
      await this.service.create(input),
      LevelDTO
    );
    return new DetailSuccessResponse({ resource })
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateLevelDTO
  ): Promise<DetailSuccessResponse<LevelDTO>> {
    const resource = Mapper.map(
      await this.service.update(id, input),
      LevelDTO
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
