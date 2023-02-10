import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from "typescript-optional";
import { ResourceMemberEntity } from '../entities/member.entity';

@Injectable()
export class ResourceMemberService {
  constructor(
    @InjectRepository(ResourceMemberEntity)
    private readonly repository: Repository<ResourceMemberEntity>
  ) { }

  async findById(id: string): Promise<Optional<ResourceMemberEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { id }})
    );
  }

  async findAll(resourceId: string): Promise<ResourceMemberEntity[]> {
    return this.repository.find({ where: { resourceId }});
  }

  async findAndCountAll(resourceId: string): Promise<[ResourceMemberEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId }});
  }

  async create(input: Partial<ResourceMemberEntity>): Promise<ResourceMemberEntity> {
    return this.repository.save(input);
  }

  async update(id: string, changes: Partial<ResourceMemberEntity>): Promise<ResourceMemberEntity> {
    const resource = await this.repository.findOne({ where: { id }})
    if (!resource) {
      throw new NotFoundException(`ResourceMember not found: ${id}`)
    }
    Object.assign(resource, changes);
    return this.repository.save(resource);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
