import { DiscoveryService } from '@golevelup/nestjs-discovery'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, UserRoles } from '@platon/core/common'
import { UserService } from '@platon/core/server'
import { LmsFilters, LmsOrdering, LMS_ORDERING_DIRECTIONS } from '@platon/feature/lti/common'
import { Repository, In } from 'typeorm'
import { Optional } from 'typescript-optional'
import { LmsUserEntity } from './entities/lms-user.entity'
import { LmsEntity } from './entities/lms.entity'
import { LTILaunchInterceptor, LTILaunchInterceptorArgs, LTI_LAUNCH_INTERCEPTOR } from './interceptor/lti-interceptor'
import { LTIPayload } from './provider/payload'
import { AdminRoles, InstructorRoles, StudentRoles } from './provider/roles'

@Injectable()
export class LTIService {
  private readonly interceptors: LTILaunchInterceptor[] = []

  constructor(
    @InjectRepository(LmsEntity)
    private readonly lmsRepo: Repository<LmsEntity>,
    @InjectRepository(LmsUserEntity)
    private readonly lmsUserRepo: Repository<LmsUserEntity>,
    private readonly userService: UserService,
    private readonly discovery: DiscoveryService
  ) {}

  async onModuleInit(): Promise<void> {
    const providers = await this.discovery.providersWithMetaAtKey(LTI_LAUNCH_INTERCEPTOR)
    providers.forEach((provider) => {
      this.interceptors.push(provider.discoveredClass.instance as LTILaunchInterceptor)
    })
  }

  async interceptLaunch(args: LTILaunchInterceptorArgs): Promise<void> {
    await Promise.all(this.interceptors.map((interceptor) => interceptor.intercept(args)))
  }

  async findLmsById(id: string): Promise<Optional<LmsEntity>> {
    return Optional.ofNullable(await this.lmsRepo.findOne({ where: { id } }))
  }

  async findLmsByConsumerKey(consumerKey: string): Promise<Optional<LmsEntity>> {
    return Optional.ofNullable(await this.lmsRepo.findOne({ where: { consumerKey } }))
  }

  async searchLMS(filters: LmsFilters = {}): Promise<[LmsEntity[], number]> {
    const query = this.lmsRepo.createQueryBuilder('lms')

    if (filters.search) {
      query.andWhere(
        `(
        name ILIKE :search
      )`,
        { search: `%${filters.search}%` }
      )
    }

    if (filters.order) {
      const fields: Record<LmsOrdering, string> = {
        NAME: 'name',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
      }

      query.orderBy(fields[filters.order], filters.direction || LMS_ORDERING_DIRECTIONS[filters.order])
    } else {
      query.orderBy('name', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount()
  }

  async createLms(lms: Partial<LmsEntity>): Promise<LmsEntity> {
    return this.lmsRepo.save(lms)
  }

  async updateLms(id: string, changes: Partial<LmsEntity>): Promise<LmsEntity> {
    const user = (await this.findLmsById(id)).orElseThrow(() => new NotFoundResponse(`Lms not found: ${id}`))
    Object.assign(user, changes)
    return this.lmsRepo.save(user)
  }

  async deleteLms(id: string) {
    return this.lmsRepo.delete(id)
  }

  async findLmsUserByUsername(username: string, lmses: LmsEntity[] = []): Promise<Optional<LmsUserEntity>> {
    return Optional.ofNullable(
      await this.lmsUserRepo.findOne({
        where: {
          username,
          lmsId: In(lmses.map((lms) => lms.id)),
        },
      })
    )
  }

  /**
   * Retrieves or generates an user for the LMS user based on the provided LTI payload.
   * It first checks for the available username fields in the payload, and if none are found,
   * it falls back to using the first character of the first name and the last name.
   *
   * @param {LmsEntity} lms - The LMS entity for which the user's information is being fetched.
   * @param {LTIPayload} payload - The LTI payload containing the user's information.
   * @returns {Promise<LmsUserEntity>} The LMS user based on the provided information.
   */
  async withLmsUser(lms: LmsEntity, payload: LTIPayload): Promise<LmsUserEntity> {
    const existing = await this.lmsUserRepo.findOne({
      where: {
        lmsId: lms.id,
        lmsUserId: payload.user_id + '',
      },
      relations: ['user'],
    })
    if (existing) {
      return existing
    }

    const lti_name = payload.ext_user_username || payload.custom_lis_user_username || payload.ext_d2l_username
    let name = lti_name
    if (!lti_name && payload.lis_person_name_family && payload.lis_person_name_given) {
      name = payload.lis_person_name_given[0].toLowerCase() + '_' + payload.lis_person_name_family.toLowerCase()
    }

    if (!name) {
      name = 'user'
    }

    let count = 1
    let username = name
    while ((await this.userService.findByUsername(username)).isPresent()) {
      username = `${name}${count}`
      count++
    }

    let role = UserRoles.student

    const isAdmin = Object.values(AdminRoles).find((role) => payload.roles.includes(role))
    const isStudent = Object.values(StudentRoles).find((role) => payload.roles.includes(role))
    const isTeacher = Object.values(InstructorRoles).find((role) => payload.roles.includes(role))

    if (isTeacher || isAdmin) {
      role = UserRoles.teacher
    } else if (isStudent) {
      role = UserRoles.student
    }

    const user = await this.userService.create({
      email: payload.lis_person_contact_email_primary,
      lastName: payload.lis_person_name_family,
      firstName: payload.lis_person_name_given,
      role,
      username,
    })

    return this.lmsUserRepo.save(
      this.lmsUserRepo.create({
        userId: user.id,
        lmsId: lms.id,
        lmsUserId: payload.user_id + '',
        username: lti_name || undefined,
        user,
      })
    )
  }
}
