import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthToken, NotFoundResponse, OrderingDirections } from '@platon/core/common'
import { AuthService, UserService } from '@platon/core/server'
import { CasFilters, CasOrdering } from '@platon/feature/cas/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CasEntity } from './entities/cas.entity'
import { CreateCasDTO, UpdateCasDTO } from './cas.dto'
import { LTIService } from '@platon/feature/lti/server'
import { AxiosError, AxiosResponse } from 'axios'
import { AxiosService } from './axios.service'
import { CasServiceValidateResponse } from './payloads'

/** How a sign-in through an institution account ended. */
export type CasSignIn =
  | { readonly outcome: 'signed-in'; readonly token: AuthToken }
  | { readonly outcome: 'no-account' }
  | { readonly outcome: 'failed' }

@Injectable()
export class CasService {
  private readonly logger = new Logger(CasService.name)

  constructor(
    @InjectRepository(CasEntity)
    private readonly casRepo: Repository<CasEntity>,
    private readonly LtiService: LTIService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly https: AxiosService
  ) {}

  /**
   * Signs in with the ticket the CAS `name` gave for `service`, the address the person was sent back
   * to: tokens for the PLaTon account linked to the institution account, or the reason there are
   * none. Every failure (ticket refused, provider unreachable, unknown CAS, database) ends as
   * `failed`, never as an error, since the person is in the middle of signing in.
   */
  async signIn(name: string, ticket: string, service: string): Promise<CasSignIn> {
    try {
      const cas = (await this.findCasByName(name)).orElseThrow(() => new NotFoundResponse(`Cas not found: ${name}`))
      const username = await this.checkCasTicket(cas.serviceValidateURL, ticket, service)
      if (username.isEmpty()) {
        this.logger.warn(`CAS ${name} answered neither a success nor a failure`)
        return { outcome: 'failed' }
      }
      const lmsUser = await this.LtiService.findLmsUserByUsername(username.get(), cas.lmses)
      if (lmsUser.isEmpty()) return { outcome: 'no-account' }
      const user = await this.userService.findById(lmsUser.get().userId)
      if (user.isEmpty()) return { outcome: 'no-account' }
      return {
        outcome: 'signed-in',
        token: await this.authService.authenticate(lmsUser.get().userId, user.get().username),
      }
    } catch (error) {
      this.logger.warn(`CAS ${name} sign-in failed: ${(error as Error).message}`)
      return { outcome: 'failed' }
    }
  }

  async checkCasTicket(serviceValidateURL: string, ticket: string, service: string): Promise<Optional<string>> {
    const data = await this.https
      .get<CasServiceValidateResponse>(serviceValidateURL, {
        params: {
          ticket: ticket,
          service: service,
          format: 'JSON',
        },
      })
      .catch((_error: AxiosError) => {
        return {
          serviceResponse: {
            authenticationFailure: { code: 'NO_RESPONSE', description: 'Your CAS provider is not accessible' },
          },
        }
      })

    let response: CasServiceValidateResponse
    if (Object.prototype.hasOwnProperty.call(data, 'data')) {
      response = (data as AxiosResponse<CasServiceValidateResponse>).data
    } else {
      response = data as unknown as CasServiceValidateResponse
    }

    if (response.serviceResponse.authenticationFailure) {
      throw new Error(response.serviceResponse.authenticationFailure.description)
    } else if (response.serviceResponse.authenticationSuccess) {
      return Optional.of(response.serviceResponse.authenticationSuccess.user)
    }
    return Optional.empty()
  }

  async findCasById(id: string): Promise<Optional<CasEntity>> {
    return Optional.ofNullable(await this.casRepo.findOne({ where: { id } }))
  }

  async findCasByName(name: string): Promise<Optional<CasEntity>> {
    return Optional.ofNullable(
      await this.casRepo
        .createQueryBuilder('cas')
        .where('cas.name = :name', { name })
        .leftJoinAndSelect('cas.lmses', 'lmses')
        .getOne()
    )
  }

  async searchCas(filters: CasFilters = {}): Promise<[CasEntity[], number]> {
    const query = this.casRepo.createQueryBuilder('cas')
    query.leftJoinAndSelect('cas.lmses', 'lmses')

    if (filters.search) {
      query.andWhere(
        `(
        cas.name ILIKE :search
      )`,
        { search: `%${filters.search}%` }
      )
    }

    if (filters.order) {
      const fields: Record<CasOrdering, string> = {
        NAME: 'cas.name',
        CREATED_AT: 'cas.created_at',
        UPDATED_AT: 'cas.updated_at',
      }

      const orderings: Record<CasOrdering, keyof typeof OrderingDirections> = {
        NAME: 'ASC',
        CREATED_AT: 'DESC',
        UPDATED_AT: 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    } else {
      query.orderBy('cas.name', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async createCas(cas: Partial<CasEntity>): Promise<CasEntity> {
    return this.casRepo.save(cas)
  }

  async updateCas(id: string, changes: Partial<CasEntity>): Promise<CasEntity> {
    const user = (await this.findCasById(id)).orElseThrow(() => new NotFoundResponse(`Cas not found: ${id}`))
    Object.assign(user, changes)
    return this.casRepo.save(user)
  }

  async deleteCas(id: string) {
    return this.casRepo.delete(id)
  }

  async deleteCasByName(name: string) {
    return this.casRepo.delete({ name })
  }

  // function that converts a CreateCasDTO to a Promise<CasEntity>
  async fromInput(input: CreateCasDTO | UpdateCasDTO): Promise<CasEntity> {
    const { lmses, ...cas } = input

    const casEntity = new CasEntity()
    Object.assign(casEntity, cas)

    if (lmses) {
      casEntity.lmses = await Promise.all(
        lmses.map(async (lmsId) => {
          const optional = await this.LtiService.findLmsById(lmsId)
          return optional.orElseThrow(() => new NotFoundResponse(`Lms not found: ${lmsId}`))
        })
      )
    }

    return casEntity
  }
}
