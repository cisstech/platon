import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { TopicEntity } from './topic.entity'
import { EventService } from '../events'
import { ON_TOPIC_FUSION_EVENT, OnTopicFusionEventPayload } from './topic.event'

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(TopicEntity)
    private readonly repository: Repository<TopicEntity>,
    private readonly eventService: EventService
  ) {}

  async findById(id: string): Promise<Optional<TopicEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { id } }))
  }

  async findAll(): Promise<[TopicEntity[], number]> {
    return this.repository.findAndCount({
      order: { name: 'ASC' },
    })
  }

  async create(user: Partial<TopicEntity>): Promise<TopicEntity> {
    return this.repository.save(user)
  }

  async update(id: string, changes: Partial<TopicEntity>): Promise<TopicEntity> {
    const topic = await this.repository.findOne({ where: { id } })
    if (!topic) {
      throw new NotFoundResponse(`Topic not found: ${id}`)
    }
    // Check if the name is already taken update the name
    if (changes.name) {
      const topicWithSameName = await this.repository.findOne({ where: { name: changes.name } })
      if (topicWithSameName && topicWithSameName.id !== id) {
        this.eventService.emit<OnTopicFusionEventPayload>(ON_TOPIC_FUSION_EVENT, {
          oldTopic: topic,
          newTopic: topicWithSameName,
        })
        Logger.log(`Topic with name ${changes.name} already exists, merging topics`, 'TopicService')
        this.repository.delete(id).catch(console.error)
        return topicWithSameName
      }
    }
    Object.assign(topic, changes)
    return this.repository.save(topic)
  }

  async delete(id: string) {
    return this.repository.delete(id)
  }
}
