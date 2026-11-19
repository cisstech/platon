import {
  Body,
  Controller,
  Delete,
  Get,
  HttpRedirectResponse,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  Req,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import {
  CreatedResponse,
  ItemResponse,
  ListResponse,
  NoContentResponse,
  NotFoundResponse,
  signInFailureUrl,
  signInUrl,
} from '@platon/core/common'
import { Mapper, Public, Roles, UUIDParam } from '@platon/core/server'
import { CAS_SIGN_IN_FAILED } from '@platon/feature/cas/common'
import { Request } from 'express'
import { URL } from 'url'
import { CasDTO, CasFiltersDTO, CreateCasDTO, UpdateCasDTO } from './cas.dto'
import { CasService } from './cas.service'

@Controller('cas')
export class CasController {
  constructor(private readonly service: CasService) {}

  @Public()
  @Get('/casnames')
  async listCas(): Promise<ListResponse<string>> {
    const [items, total] = await this.service.searchCas({})
    const resources = items.map((item) => item.name)
    return new ListResponse({ total, resources })
  }

  /**
   * Sends the person to the CAS, which sends them back here with a ticket; then hands the tokens, or
   * the failure, to the sign-in page. The service address is the same both ways: the CAS checks it.
   */
  @Public()
  @Get('/login/:casname')
  @Redirect()
  async login(
    @Param('casname') casname: string,
    @Query() query: { ticket?: string; next?: string },
    @Req() request: Request
  ): Promise<HttpRedirectResponse> {
    const service = new URL(`https://${request.get('host')}${request.baseUrl}${request.path}`)
    if (query.next) {
      service.searchParams.set('next', query.next)
    }

    if (!query.ticket) {
      const cas = await this.service.findCasByName(casname)
      if (cas.isEmpty()) {
        return { url: signInFailureUrl(CAS_SIGN_IN_FAILED, query.next), statusCode: 302 }
      }
      const login = new URL(cas.get().loginURL)
      login.searchParams.set('service', service.toString())
      return { url: login.toString(), statusCode: 302 }
    }

    const signIn = await this.service.signIn(casname, query.ticket, service.toString())
    switch (signIn.outcome) {
      case 'signed-in':
        return { url: signInUrl(signIn.token, query.next), statusCode: 302 }
      case 'no-account':
        return { url: '/login/no-account', statusCode: 302 }
      case 'failed':
        return { url: signInFailureUrl(CAS_SIGN_IN_FAILED, query.next), statusCode: 302 }
    }
  }

  @ApiBearerAuth()
  @Get()
  @Roles('admin')
  async searchCas(@Query() filters: CasFiltersDTO): Promise<ListResponse<CasDTO>> {
    const [items, total] = await this.service.searchCas(filters)
    const resources = Mapper.mapAll(items, CasDTO)
    return new ListResponse({ total, resources })
  }

  @ApiBearerAuth()
  @Get('/:id')
  @Roles('admin')
  async findCas(@UUIDParam('id') id: string): Promise<ItemResponse<CasDTO>> {
    const optional = await this.service.findCasById(id)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Cas not found: ${id}`)),
      CasDTO
    )
    return new ItemResponse({ resource })
  }

  @ApiBearerAuth()
  @Post('/')
  @Roles('admin')
  async createCas(@Body() input: CreateCasDTO): Promise<CreatedResponse<CasDTO>> {
    const res = await this.service.createCas({ ...(await this.service.fromInput(input)) })
    const resource = Mapper.map(res, CasDTO)
    return new CreatedResponse({ resource })
  }

  @ApiBearerAuth()
  @Patch('/:id')
  @Roles('admin')
  async updateCas(@UUIDParam('id') id: string, @Body() input: UpdateCasDTO): Promise<ItemResponse<CasDTO>> {
    const res = await this.service.updateCas(id, { ...(await this.service.fromInput(input)) })
    const resource = Mapper.map(res, CasDTO)
    return new ItemResponse({ resource })
  }

  @ApiBearerAuth()
  @Delete('/:id')
  @Roles('admin')
  async deleteCas(@UUIDParam('id') id: string): Promise<NoContentResponse> {
    await this.service.deleteCas(id)
    return new NoContentResponse()
  }
}
