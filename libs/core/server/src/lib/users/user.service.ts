import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) { }

  async findById(id: string): Promise<Optional<UserEntity>> {
    return Optional.ofNullable(
      await this.userRepo.findOne({ where: { id } })
    );
  }

  async findByUsername(username: string): Promise<Optional<UserEntity>> {
    return Optional.ofNullable(
      await this.userRepo.findOne({ where: { username } })
    );
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find();
  }

  async findAndCountAll(): Promise<[UserEntity[], number]> {
    return this.userRepo.findAndCount();
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.userRepo.save(user);
  }

  async update(id: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id }})
    if (!user) {
      throw new NotFoundException(`User not found: ${id}`)
    }
    Object.assign(user, changes);
    return this.userRepo.save(user);
  }

  async updateByUsername(username: string, changes: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { username }})
    if (!user) {
      throw new NotFoundException(`User not found: ${username}`)
    }
    Object.assign(user, changes);
    return this.userRepo.save(user);
  }
}
