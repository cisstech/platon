import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LmsCourseEntity } from '../entites/lms-course.entity'
import { Repository } from 'typeorm'
import { Optional } from 'typescript-optional'

@Injectable()
export class LmsCourseService {
  constructor(
    @InjectRepository(LmsCourseEntity)
    private readonly lmsCourseRepository: Repository<LmsCourseEntity>
  ) {}

  async create(data: Partial<LmsCourseEntity>): Promise<LmsCourseEntity> {
    return this.lmsCourseRepository.save(data)
  }

  async findLmsCourseFromLTI(lmsCourseId: string, lmsId: string): Promise<Optional<LmsCourseEntity>> {
    return Optional.ofNullable(await this.lmsCourseRepository.findOne({ where: { lmsCourseId, lmsId } }))
  }
}
