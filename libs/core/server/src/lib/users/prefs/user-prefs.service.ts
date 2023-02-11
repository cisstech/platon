import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserPrefs } from '@platon/core/common';
import { Repository } from 'typeorm';
import { LevelService } from '../../levels';
import { TopicService } from '../../topics';
import { UserPrefsEntity } from './user-prefs.entity';

@Injectable()
export class UserPrefsService {
  constructor(
    @InjectRepository(UserPrefsEntity)
    private readonly repository: Repository<UserPrefsEntity>,
    private readonly levelService: LevelService,
    private readonly topicService: TopicService,
  ) { }

  async findByUserId(userId: string): Promise<UserPrefsEntity> {
    let prefs = await this.repository.findOne({ where: { userId } })
    if (!prefs) {
      prefs = await this.repository.save(
        this.repository.create({ userId })
      )
    }
    return prefs
  }

  async updateByUserId(userId: string, changes: Partial<UserPrefsEntity>): Promise<UserPrefsEntity> {
    const prefs = await this.findByUserId(userId);
    Object.assign(prefs, changes);
    return this.repository.save(prefs);
  }

  async fromInput(input: UpdateUserPrefs): Promise<UserPrefsEntity> {
    const { levels, topics, ...props } = input;

    const newRes = new UserPrefsEntity()
    Object.assign(newRes, props);

    if (levels) {
      newRes.levels = (await Promise.all(
        levels.map(level => this.levelService.findById(level))
      )).map(optional => optional.orElseThrow(() => new BadRequestException(`Level not found: ${levels}`)))
    }

    if (topics) {
      newRes.topics = (await Promise.all(
        topics.map(topic => this.topicService.findById(topic))
      )).map(optional => optional.orElseThrow(() => new BadRequestException(`Topic not found: ${topics}`)))
    }

    return newRes
  }
}
