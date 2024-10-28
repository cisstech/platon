import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse, NotFoundResponse } from '@platon/core/common'
import { Mapper, UUIDParam } from '@platon/core/server'
import { CreateLmsDTO, LmsDTO, LmsFiltersDTO, UpdateLmsDTO } from './lti.dto'
import { LTIService } from './lti.service'

@Controller('lti')
@ApiTags('LTI')
export class LTIController {
  constructor(private readonly service: LTIService) {}

  @Get('/lms')
  async searchLms(@Query() filters: LmsFiltersDTO): Promise<ListResponse<LmsDTO>> {
    const [users, total] = await this.service.searchLMS(filters)
    const resources = Mapper.mapAll(users, LmsDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/lms/:id')
  async findLms(@UUIDParam('id') id: string): Promise<ItemResponse<LmsDTO>> {
    const optional = await this.service.findLmsById(id)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Lms not found: ${id}`)),
      LmsDTO
    )
    return new ItemResponse({ resource })
  }

  @Post('/lms')
  async createLms(@Body() input: CreateLmsDTO): Promise<CreatedResponse<LmsDTO>> {
    const resource = Mapper.map(await this.service.createLms(input), LmsDTO)
    return new CreatedResponse({ resource })
  }

  @Patch('/lms/:id')
  async updateLms(@UUIDParam('id') id: string, @Body() input: UpdateLmsDTO): Promise<ItemResponse<LmsDTO>> {
    const resource = Mapper.map(await this.service.updateLms(id, input), LmsDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/lms/:id')
  async deleteLms(@UUIDParam('id') id: string): Promise<NoContentResponse> {
    await this.service.deleteLms(id)
    return new NoContentResponse()
  }
}
