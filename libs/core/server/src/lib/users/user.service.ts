import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

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

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.userRepo.save(user);
  }
}
