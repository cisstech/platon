import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceMemberDTO } from '@platon/feature/resource/common';
import { DataSource, Repository } from 'typeorm';
import { ResourceInvitationEntity } from '../entities/invitation.entity';
import { ResourceMemberEntity } from '../entities/member.entity';

@Injectable()
export class ResourceInvitationService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ResourceInvitationEntity)
    private readonly repository: Repository<ResourceInvitationEntity>,
  ) { }

  async findAll(resourceId: string): Promise<[ResourceInvitationEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId } });
  }

  async create(input: Partial<ResourceInvitationEntity>): Promise<ResourceInvitationEntity> {
    return this.repository.save(input);
  }

  async accept(id: string): Promise<ResourceMemberDTO> {
    return this.dataSource.transaction(async manager => {
      const invitation = await manager.findOne(ResourceInvitationEntity, { where: { id } })
      if (!invitation) {
        throw new NotFoundException(`ResourceInvitation not found: ${id}`)
      }
      await manager.remove(invitation)
      return manager.save(
        manager.create(ResourceMemberEntity, {
          resourceId: invitation.resourceId,
          userId: invitation.inviteeId,
          permissions: invitation.permissions
        })
      )
    })
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
