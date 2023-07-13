import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { DataSource, Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { ResourceInvitationEntity } from './invitation.entity'
import { ResourceMemberEntity } from '../members/member.entity'
import { ResourceMemberService } from '../members/member.service'

@Injectable()
export class ResourceInvitationService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(ResourceInvitationEntity)
    private readonly repository: Repository<ResourceInvitationEntity>,
    private readonly memberService: ResourceMemberService
  ) {}

  async findByInviteeId(resourceId: string, inviteeId: string): Promise<Optional<ResourceInvitationEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { resourceId, inviteeId } }))
  }

  async findAll(resourceId: string): Promise<[ResourceInvitationEntity[], number]> {
    return this.repository.findAndCount({ where: { resourceId } })
  }

  async findAllByInviteeId(inviteeId: string): Promise<[ResourceInvitationEntity[], number]> {
    return this.repository.findAndCount({ where: { inviteeId } })
  }

  async create(input: Partial<ResourceInvitationEntity>): Promise<ResourceInvitationEntity> {
    const member = await this.memberService.findByUserId(input.resourceId as string, input.inviteeId as string)
    if (member.isPresent()) {
      throw new BadRequestException('There is already a member entry for the given user')
    }
    return this.repository.save(input)
  }

  async accept(resourceId: string, inviteeId: string): Promise<ResourceMemberEntity> {
    return this.dataSource.transaction(async (manager) => {
      const invitation = await manager.findOne(ResourceInvitationEntity, {
        where: { resourceId, inviteeId },
      })
      if (!invitation) {
        throw new NotFoundResponse(`ResourceInvitation not found for user: ${inviteeId}`)
      }
      await manager.remove(invitation)
      return manager.save(
        manager.create(ResourceMemberEntity, {
          resourceId: invitation.resourceId,
          userId: invitation.inviteeId,
          inviterId: invitation.inviterId,
          permissions: invitation.permissions,
        })
      )
    })
  }

  async delete(resourceId: string, inviteeId: string) {
    return this.repository.delete({ resourceId, inviteeId })
  }
}
