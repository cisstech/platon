import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, OrderingDirections } from '@platon/core/common'
import { CasFilters, CasOrdering } from '@platon/feature-cas-common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { CasEntity } from './entities/cas.entity'
import { CreateCasDTO, UpdateCasDTO } from './cas.dto'
import { LTIService } from '@platon/feature/lti/server'

@Injectable()
export class CasService {
  constructor(
    @InjectRepository(CasEntity)
    private readonly casRepo: Repository<CasEntity>,
    private readonly LtiService: LTIService
  ) {}

  async findCasById(id: string): Promise<Optional<CasEntity>> {
    return Optional.ofNullable(await this.casRepo.findOne({ where: { id } }))
  }

  async findCasByName(name: string): Promise<Optional<CasEntity>> {
    return Optional.ofNullable(await this.casRepo.findOne({ where: { name } }))
  }

  async searchCas(filters: CasFilters = {}): Promise<[CasEntity[], number]> {
    const query = this.casRepo.createQueryBuilder('cas')
    query.leftJoinAndSelect('cas.lmses', 'lmses')

    if (filters.search) {
      query.andWhere(
        `(
        name ILIKE :search
      )`,
        { search: `%${filters.search}%` }
      )
    }

    if (filters.order) {
      const fields: Record<CasOrdering, string> = {
        NAME: 'name',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
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
