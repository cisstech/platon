import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Redirect,
  Req,
  HttpRedirectResponse,
} from '@nestjs/common'
import { CreateCasDTO, UpdateCasDTO } from './cas.dto'
import { AuthService, Mapper, Public } from '@platon/core/server'
import { HttpService } from '@nestjs/axios'
import { CasService } from './cas.service'
import { CasDTO, CasFiltersDTO } from './cas.dto'
import { CreatedResponse, ItemResponse, ListResponse, NoContentResponse, NotFoundResponse } from '@platon/core/common'
import { Request } from 'express'
import { catchError, firstValueFrom, of } from 'rxjs'
import { CasServiceValidateResponse } from './payloads'
import { AxiosError, AxiosResponse } from 'axios'
import { Optional } from 'typescript-optional'
import { LTIService } from '@platon/feature/lti/server'

@Controller('cas')
export class CasController {
  constructor(
    private readonly service: CasService,
    private readonly http: HttpService,
    private readonly LtiService: LTIService,
    private readonly authService: AuthService
  ) {}

  async checkCasTicket(serviceValidateURL: string, ticket: string, service: string): Promise<Optional<string>> {
    const data = await firstValueFrom(
      this.http
        .get<CasServiceValidateResponse>(serviceValidateURL, {
          params: {
            ticket: ticket,
            service: service,
            format: 'JSON',
          },
        })
        .pipe(
          catchError((_error: AxiosError) => {
            return of<CasServiceValidateResponse>({
              serviceResponse: {
                authenticationFailure: { code: 'NO_RESPONSE', description: 'Your CAS provider is not accessible' },
              },
            })
          })
        )
    )
    let response: CasServiceValidateResponse
    if (Object.prototype.hasOwnProperty.call(data, 'data')) {
      response = (data as AxiosResponse<CasServiceValidateResponse>).data
    } else {
      response = data as CasServiceValidateResponse
    }

    if (response.serviceResponse.authenticationFailure) {
      throw new Error(response.serviceResponse.authenticationFailure.description)
    } else if (response.serviceResponse.authenticationSuccess) {
      const user = response.serviceResponse.authenticationSuccess.user
      //   const attributes = response.serviceResponse.authenticationSuccess.attributes
      return Optional.of(user)
    }
    return Optional.empty()
  }

  @Public()
  @Get('/casnames')
  async listCas(): Promise<ListResponse<string>> {
    const [items, total] = await this.service.searchCas({})
    const resources = items.map((item) => item.name)
    return new ListResponse({ total, resources })
  }

  @Public()
  @Get('/login/:casname')
  @Redirect()
  async login(
    @Param('casname') casname: string,
    @Query() query: { ticket: string; next?: string },
    @Req() request: Request
  ): Promise<HttpRedirectResponse> {
    const service = `https://${request.get('Host')}${request.originalUrl.split('?')[0]}`

    if (!query.ticket) {
      return {
        url:
          (await this.service.findCasByName(casname)).orElseThrow(
            () => new NotFoundResponse(`Cas not found: ${casname}`)
          ).loginURL + `?service=${service}`,
        statusCode: 302,
      }
    } else {
      const casEntity = (await this.service.findCasByName(casname)).orElseThrow(
        () => new NotFoundResponse(`Cas not found: ${casname}`)
      )

      const username = await this.checkCasTicket(casEntity.serviceValidateURL, query.ticket, service)
      const lmsUserEntity = await (
        await this.LtiService.findLmsUserByUsername(
          username.orElseThrow(() => new Error('User not found')),
          casEntity.lmses
        )
      ).orElseThrow(() => new Error('User not found'))

      const token = await this.authService.authenticate(lmsUserEntity.user.id, lmsUserEntity.user.username)
      return {
        url: `/login?access-token=${token.accessToken}&refresh-token=${token.refreshToken}&next=${query.next}`,
        statusCode: 302,
      }
    }
  }

  @Get()
  async searchCas(@Query() filters: CasFiltersDTO): Promise<ListResponse<CasDTO>> {
    const [items, total] = await this.service.searchCas(filters)
    const resources = Mapper.mapAll(items, CasDTO)
    return new ListResponse({ total, resources })
  }

  @Get('/:id')
  async findCas(@Param('id') id: string): Promise<ItemResponse<CasDTO>> {
    const optional = await this.service.findCasById(id)
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`Cas not found: ${id}`)),
      CasDTO
    )
    return new ItemResponse({ resource })
  }

  @Post('/')
  async createCas(@Body() input: CreateCasDTO): Promise<CreatedResponse<CasDTO>> {
    const res = await this.service.createCas({ ...(await this.service.fromInput(input)) })
    const resource = Mapper.map(res, CasDTO)
    return new CreatedResponse({ resource })
  }

  @Patch('/:id')
  async updateCas(@Param('id') id: string, @Body() input: UpdateCasDTO): Promise<ItemResponse<CasDTO>> {
    const res = await this.service.updateCas(id, { ...(await this.service.fromInput(input)) })
    const resource = Mapper.map(res, CasDTO)
    return new ItemResponse({ resource })
  }

  @Delete('/:id')
  async deleteCas(@Param('id') id: string): Promise<NoContentResponse> {
    await this.service.deleteCas(id)
    return new NoContentResponse()
  }
}
