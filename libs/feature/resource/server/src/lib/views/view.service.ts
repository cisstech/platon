import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ResourceViewEntity } from './view.entity';

@Injectable()
export class ResourceViewService {
  constructor(
    @InjectRepository(ResourceViewEntity)
    private readonly repository: Repository<ResourceViewEntity>
  ) { }

  async findAll(userId: string): Promise<[ResourceViewEntity[], number]> {
    return this.repository.findAndCount({
      where: { userId },
      relations: { resource: true },
      order: {
        updatedAt: 'DESC'
      }
    })
  }

  async create(input: Partial<ResourceViewEntity>): Promise<void> {
    const max = 5;
    const lastView = await this.repository.findOne({
      where: {
        userId: input.userId,
        resourceId: input.resourceId
      }
    })

    if (lastView) {
      lastView.updatedAt = new Date()
      await this.repository.save(lastView) // update timestamp
      return
    } else {
      await this.repository.save(input)
    }

    const all = await this.repository.find({
      where: { userId: input.userId },
      order: {
        updatedAt: 'DESC'
      }
    })

    if (all.length > max) {
      await this.repository.delete({
        userId: input.userId,
        id: In(
          all.map(r => r.id).slice(max)
        )
      })
    }
  }
}
