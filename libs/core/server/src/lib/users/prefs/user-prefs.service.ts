import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse, UpdateUserPrefs } from '@platon/core/common'
import { Repository } from 'typeorm'
import { LevelService } from '../../levels'
import { TopicService } from '../../topics'
import { UserPrefsEntity } from './user-prefs.entity'
import { OnEvent } from '@nestjs/event-emitter'
import { ON_LEVEL_FUSION_EVENT, OnLevelFusionEventPayload } from '../../levels/level.event'
import { ON_TOPIC_FUSION_EVENT, OnTopicFusionEventPayload } from '../../topics/topic.event'

@Injectable()
export class UserPrefsService {
  constructor(
    @InjectRepository(UserPrefsEntity)
    private readonly repository: Repository<UserPrefsEntity>,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService
  ) {}

  @OnEvent(ON_LEVEL_FUSION_EVENT)
  async onLevelFusion(payload: OnLevelFusionEventPayload) {
    const { oldLevel, newLevel } = payload
    const prefs = await this.repository.createQueryBuilder('prefs').leftJoinAndSelect('prefs.levels', 'level').getMany()
    console.log('prefs', JSON.stringify(prefs, null, 2))
    await Promise.all(
      prefs.map((pref) => {
        pref.levels = pref.levels.map((l) => (l.id === oldLevel.id ? newLevel : l))
        return this.repository.save(pref)
      })
    )
  }

  @OnEvent(ON_TOPIC_FUSION_EVENT)
  async onTopicFusion(payload: OnTopicFusionEventPayload) {
    const { oldTopic, newTopic } = payload
    const prefs = await this.repository.createQueryBuilder('prefs').leftJoinAndSelect('prefs.topics', 'topic').getMany()
    console.log('prefs', JSON.stringify(prefs, null, 2))
    await Promise.all(
      prefs.map((pref) => {
        pref.topics = pref.topics.map((t) => (t.id === oldTopic.id ? newTopic : t))
        return this.repository.save(pref)
      })
    )
    Logger.log(`Merging topics ${oldTopic.name} into ${newTopic.name}`, 'UserPrefsService')
  }

  async findByUserId(userId: string): Promise<UserPrefsEntity> {
    let prefs = await this.repository.findOne({ where: { userId } })
    if (!prefs) {
      prefs = await this.repository.save(this.repository.create({ userId, levels: [], topics: [] }))
    }
    return prefs
  }

  async updateByUserId(userId: string, changes: Partial<UserPrefsEntity>): Promise<UserPrefsEntity> {
    const prefs = await this.findByUserId(userId)
    Object.assign(prefs, changes)
    return this.repository.save(prefs)
  }

  async fromInput(input: UpdateUserPrefs): Promise<UserPrefsEntity> {
    const { levels, topics, ...props } = input

    const newRes = new UserPrefsEntity()
    Object.assign(newRes, props)

    if (levels) {
      newRes.levels = await Promise.all(
        levels.map(async (levelId) => {
          const optional = await this.levelService.findById(levelId)
          return optional.orElseThrow(() => new NotFoundResponse(`Level not found: ${levelId}`))
        })
      )
    }

    if (topics) {
      newRes.topics = await Promise.all(
        topics.map(async (topicId) => {
          const optional = await this.topicService.findById(topicId)
          return optional.orElseThrow(() => new NotFoundResponse(`Topic not found: ${topicId}`))
        })
      )
    }

    return newRes
  }
}
