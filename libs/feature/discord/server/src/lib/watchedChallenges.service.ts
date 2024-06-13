import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NotFoundResponse } from '@platon/core/common'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'
import { WatchedChallengesEntity } from './watchedChallenges.entity'

@Injectable()
export class WatchedChallengesService {
  constructor(
    @InjectRepository(WatchedChallengesEntity)
    private readonly watchedChallengesRepository: Repository<WatchedChallengesEntity>
  ) {}

  async findById(id: string): Promise<Optional<WatchedChallengesEntity>> {
    const challenge = await this.watchedChallengesRepository.findOne({ where: { challengeId: id } })
    return Optional.ofNullable(challenge)
  }

  async findAll(): Promise<WatchedChallengesEntity[]> {
    return this.watchedChallengesRepository.find()
  }

  async create(input: Partial<WatchedChallengesEntity>): Promise<WatchedChallengesEntity> {
    const alreadyAssociated = await this.watchedChallengesRepository.findOne({
      where: { challengeId: input.challengeId, channelId: input.channelId },
    })
    if (alreadyAssociated) {
      console.error(`Challenge ${input.challengeId} already associated with channel ${input.channelId}`)
      return alreadyAssociated
    }
    return this.watchedChallengesRepository.save(input)
  }

  async delete(id: string): Promise<void> {
    const challenge = await this.watchedChallengesRepository.findOne({ where: { id } })
    if (!challenge) {
      throw new NotFoundResponse(`Challenge not found: ${id}`)
    }

    await this.watchedChallengesRepository.remove(challenge)
  }

  async deleteAll(): Promise<void> {
    await this.watchedChallengesRepository.clear()
  }
}
