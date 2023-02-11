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

  async findByUserId(resourceId: string, userId: string): Promise<Optional<ResourceMemberEntity>> {
    return Optional.ofNullable(
      await this.repository.findOne({ where: { resourceId, userId } })
    );
  }

  async findAll(resourceId: string): Promise<[ResourceMemberEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId } });
  }

  async updateByUserId(
    resourceId: string,
    userId: string,
    changes: Partial<ResourceMemberEntity>
  ): Promise<ResourceMemberEntity> {
    const resource = await this.repository.findOne({ where: { resourceId, userId } })
    if (!resource) {
      throw new NotFoundException(`ResourceMember not found: ${userId}`)
    }
    Object.assign(resource, changes);
    return this.repository.save(resource);
  }

  async deleteByUserId(resourceId: string, userId: string) {
    return this.repository.remove(
      (
        await this.findByUserId(resourceId, userId)
      ).orElseThrow(() => new NotFoundException(`ResourceMember not found: ${userId}`))
    );
  }
}
