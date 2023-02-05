import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Optional } from 'typescript-optional';
import { LmsEntity } from './entities/lms.entity';

@Injectable()
export class LTIService {
  constructor(
    @InjectRepository(LmsEntity)
    private readonly lmsRepo: Repository<LmsEntity>
  ) { }

  async findLMS(consumerKey: string): Promise<Optional<LmsEntity>> {
    return Optional.ofNullable(
      await this.lmsRepo.findOne({ where: { consumerKey } })
    );
  }
}
