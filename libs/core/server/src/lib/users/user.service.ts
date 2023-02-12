import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderingDirections, UserFilters, UserOrderings } from '@platon/core/common';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>
  ) { }

  async findById(id: string): Promise<Optional<UserEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { id } })
    );
  }

  async findByUsername(username: string): Promise<Optional<UserEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { username } })
    );
  }

  async search(filters: UserFilters = {}): Promise<[UserEntity[], number]> {
    const query = this.repository.createQueryBuilder('user')

    if (filters.roles) {
      query.andWhere('role IN (:...roles)', { roles: filters.roles })
    }

    if (filters.search) {
      query.andWhere(`(
        username ILIKE :search
        OR email ILIKE :search
        OR f_unaccent(first_name) ILIKE f_unaccent(:search)
        OR f_unaccent(last_name) ILIKE f_unaccent(:search)
      )`, { search: `%${filters.search}%` })
    }

    if (filters.order) {
      const fields: Record<UserOrderings, string> = {
        'NAME': 'username',
        'CREATED_AT': 'created_at',
        'UPDATED_AT': 'updated_at',
      }

      const orderings: Record<UserOrderings, keyof typeof OrderingDirections> = {
        'NAME': 'ASC',
        'CREATED_AT': 'DESC',
        'UPDATED_AT': 'DESC',
      }

      query.orderBy(fields[filters.order], filters.direction || orderings[filters.order])
    } else {
      query.orderBy('username', 'ASC')
    }

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return query.getManyAndCount();
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repository.save(user);
  }

  async update(id: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException(`User not found: ${id}`)
    }
    Object.assign(user, changes);
    return this.repository.save(user);
  }

  async updateByUsername(username: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.repository.findOne({ where: { username } })
    if (!user) {
      throw new NotFoundException(`User not found: ${username}`)
    }
    Object.assign(user, changes);
    return this.repository.save(user);
  }
}
