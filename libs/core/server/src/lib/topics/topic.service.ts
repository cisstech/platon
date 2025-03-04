import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { TopicEntity } from './topic.entity'
import { EventService } from '../events'
import { ON_TOPIC_FUSION_EVENT, OnTopicFusionEventPayload } from './topic.event'
import { StringUtilsService } from '../utils'

@Injectable()
export class TopicService {
  private readonly SIMILARITY_THRESHOLD = 0.8
  private readonly logger = new Logger(TopicService.name)
  constructor(
    @InjectRepository(TopicEntity)
    private readonly repository: Repository<TopicEntity>,
    private readonly eventService: EventService,
    private readonly stringUtils: StringUtilsService
  ) {}

  async findById(id: string): Promise<Optional<TopicEntity>> {
    return Optional.ofNullable(await this.repository.findOne({ where: { id } }))
  }

  async findAll(): Promise<[TopicEntity[], number]> {
    return this.repository.findAndCount({
      order: { name: 'ASC' },
    })
  }

  private async findSimilarTopic(newName: string, existingTopics: TopicEntity[]): Promise<TopicEntity | null> {
    const normalizedNewName = this.stringUtils.normalizeString(newName)

    for (const topic of existingTopics) {
      const similarity = this.stringUtils.calculateSimilarity(
        normalizedNewName,
        this.stringUtils.normalizeString(topic.name)
      )

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        return topic
      }
    }

    return null
  }

  async create(topic: Partial<TopicEntity>, force?: boolean): Promise<{ topic: TopicEntity; existing: boolean }> {
    // Si force est true, on crée directement le topic
    if (force) {
      const newTopic = await this.repository.save(topic)
      return { topic: newTopic, existing: false }
    }

    // Sinon, on cherche un topic similaire
    const [existingTopics, _] = await this.findAll()
    const similarTopic = topic.name ? await this.findSimilarTopic(topic.name, existingTopics) : null

    // Si un topic similaire existe, on le renvoie
    if (similarTopic) {
      return { topic: similarTopic, existing: true }
    }

    const newTopic = await this.repository.save(topic)
    return { topic: newTopic, existing: false }
  }

  async update(id: string, changes: Partial<TopicEntity>): Promise<TopicEntity> {
    const topic = await this.repository.findOne({ where: { id } })
    if (!topic) {
      throw new NotFoundResponse(`Topic not found: ${id}`)
    }
    // Check if the name is already taken before updating the name
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
