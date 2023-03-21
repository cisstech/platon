import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundResponse, OrderingDirections, UserRoles } from '@platon/core/common';
import { UserService } from '@platon/core/server';
import { LmsFilters, LmsOrdering } from '@platon/feature/lti/common';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { LmsUserEntity } from './entities/lms-user.entity';
import { LmsEntity } from './entities/lms.entity';
import { LTIPayload } from './provider/payload';

@Injectable()
export class LTIService {
  constructor(
    @InjectRepository(LmsEntity)
    private readonly lmsRepo: Repository<LmsEntity>,
    @InjectRepository(LmsUserEntity)
    private readonly lmsUserRepo: Repository<LmsUserEntity>,
    private readonly userService: UserService,
  ) { }

  async findLmsById(id: string): Promise<Optional<LmsEntity>> {
    return Optional.ofNullable(
      await this.lmsRepo.findOne({ where: { id } })
    );
  }

  async findLmsByConsumerKey(consumerKey: string): Promise<Optional<LmsEntity>> {
    return Optional.ofNullable(
      await this.lmsRepo.findOne({ where: { consumerKey } })
    );
  }

  async searchLMS(filters: LmsFilters = {}): Promise<[LmsEntity[], number]> {
    const query = this.lmsRepo.createQueryBuilder('lms')

    if (filters.search) {
      query.andWhere(`(
        name ILIKE :search
      )`, { search: `%${filters.search}%` })
    }

    if (filters.order) {
      const fields: Record<LmsOrdering, string> = {
        'NAME': 'username',
        'CREATED_AT': 'created_at',
        'UPDATED_AT': 'updated_at',
      }

      const orderings: Record<LmsOrdering, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    } else {
      query.orderBy('name', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount();
  }

  async createLms(lms: Partial<LmsEntity>): Promise<LmsEntity> {
    return this.lmsRepo.save(lms);
  }

  async updateLms(id: string, changes: Partial<LmsEntity>): Promise<LmsEntity> {
    const user = (
      await this.findLmsById(id)
    ).orElseThrow(() => new NotFoundResponse(`Lms not found: ${id}`));
    Object.assign(user, changes);
    return this.lmsRepo.save(user);
  }

  async deleteLms(id: string) {
    return this.lmsRepo.delete(id);
  }

  async createLmsUser(lms: LmsEntity, payload: LTIPayload) {
    const user = await this.userService.create({
      email: payload.lis_person_contact_email_primary,
      lastName: payload.lis_person_name_family,
      firstName: payload.lis_person_name_given,
      role: UserRoles.teacher,
      username: 'random'
    })

    await this.lmsUserRepo.save(
       this.lmsUserRepo.create({
        userId: user.id,
        lmsId: lms.id,
        lmsUserId: payload.user_id + '',
       })
    )

  }
}

/*

def create_lti_user(lms: LMS, params: LTIParams) -> User:
    """Creates a `LTIUser` object from a LTI request params.

    If the user already exists then it's informations will be updated

    Args:
        lms (LMS): LMS on which the user belongs to.
        params (LTIParams): The LTI request parameters.

    Returns:
        User: Django user model object.
    """

    user_id = params.user_id
    email = params.lis_person_contact_email_primary
    last_name = params.lis_person_name_family
    first_name = params.lis_person_name_given

    username = params.ext_user_username

    try:
        lti_user = LTIUser.objects.get(lms=lms, lms_user_id=user_id)
        logger.info(f'LTI: Found an existing user for {username}')
    except ObjectDoesNotExist:
        logger.info(f'LTI: Creating a new user for {username}')
        i = -1
        UserModel = get_user_model()
        while True:
            try:
                if i == -1:  # attempt first with ext_user_username
                    user = UserModel.objects.create_user(username=username)
                else:
                    user = UserModel.objects.create_user(
                        username=username + ("" if not i else str(i))
                    )
            except IntegrityError:
                username = (first_name[0].lower() + last_name.lower())
                i += 1
                continue
            break

        lti_user = LTIUser.objects.create(
            lms=lms,
            user=user,
            lms_user_id=user_id
        )

    lti_user.user.email = email
    lti_user.user.last_name = last_name
    lti_user.user.first_name = first_name
    lti_user.user.save()

    return lti_user.user
 */
