import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AnnouncementEntity } from './announcement.entity'
import { AnnouncementReadEntity } from './announcement-read.entity'
import { visibleTo } from './announcement.sql'
import { In, Repository } from 'typeorm'
//import { NotificationService } from "@cisstech/nge-ide/core";
import { NotFoundResponse } from '@platon/core/common'
import { UserRoles } from '@platon/core/common'
import { AnnouncementFilters } from '@platon/feature/announcement/common'

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name)

  constructor(
    @InjectRepository(AnnouncementEntity) private readonly repository: Repository<AnnouncementEntity>,
    @InjectRepository(AnnouncementReadEntity) private readonly reads: Repository<AnnouncementReadEntity>
  ) {}

  async create(announcement: Partial<AnnouncementEntity>): Promise<AnnouncementEntity> {
    const newAnnouncennouncement = await this.repository.save(this.repository.create(announcement))
    if (newAnnouncennouncement.active) {
      // On publie l'annonce
    }
    return newAnnouncennouncement
  }

  async update(id: string, changes: Partial<AnnouncementEntity>): Promise<AnnouncementEntity> {
    const annoucement = await this.findById(id)
    const wasActive = annoucement.active

    Object.assign(annoucement, changes)
    const updated = await this.repository.save(annoucement)
    if (!wasActive && updated.active) {
      // On fait l'annonce
    }
    return annoucement
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Annonce avec id ${id} non trouvée`)
    }
    this.logger.log(`[${id}] - Annonce a été supprimée`)
  }

  async search(filters: AnnouncementFilters = {}): Promise<[AnnouncementEntity[], number]> {
    const query = this.repository.createQueryBuilder('announcement')
    query.leftJoinAndSelect('announcement.publisher', 'publisher')

    const search = filters.search?.trim()
    if (search) {
      query.andWhere(
        `(
          announcement.title ILIKE :search OR
          announcement.description ILIKE :search
        )`,
        { search: `%${search}%` }
      )
    }

    if (filters.active !== undefined) {
      query.andWhere('announcement.active = :active', { active: filters.active })
    }

    query.orderBy('announcement.created_at', 'DESC')

    if (filters.offset) {
      query.offset(filters.offset)
    }

    if (filters.limit) {
      query.limit(filters.limit)
    }

    const [items, count] = await query.getManyAndCount()
    return [items, count]
  }

  async findById(id: string): Promise<AnnouncementEntity> {
    const announcement = await this.repository.findOne({
      where: { id },
      relations: ['publisher'],
    })

    if (!announcement) {
      throw new NotFoundResponse(`Annonce avec id ${id} non trouvée`)
    }
    return announcement
  }

  async getVisibleForUser(
    userId: string,
    userRole: UserRoles,
    filters: AnnouncementFilters = {}
  ): Promise<[AnnouncementEntity[], number]> {
    const queryBuilder = this.repository
      .createQueryBuilder('announcement')
      .leftJoin('announcement.publisher', 'publisher')
      .select([
        'announcement.id',
        'announcement.createdAt',
        'announcement.updatedAt',
        'announcement.title',
        'announcement.description',
        'announcement.active',
        'announcement.icon',
        'announcement.version',
        'announcement.displayUntil',
        'announcement.displayDurationInDays',
        'announcement.targetedRoles',
        'announcement.actions',
        'publisher.id',
        'publisher.username',
        'publisher.firstName',
        'publisher.lastName',
        'publisher.role',
      ])
    visibleTo(queryBuilder, userRole)

    if (filters.search) {
      queryBuilder.andWhere('(announcement.title ILIKE :search OR announcement.description ILIKE :search)', {
        search: `%${filters.search}%`,
      })
    }

    queryBuilder.orderBy('announcement.createdAt', 'DESC')
    queryBuilder.take(filters.limit ?? 20)

    if (filters.offset) {
      queryBuilder.skip(filters.offset)
    }

    try {
      const [items, count] = await queryBuilder.getManyAndCount()
      return [await this.withReads(items, userId), count]
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.logger.error(`Erreur lors de la récupération des annonces: ${err.message}`)
      throw err
    }
  }

  async findByIdForUser(id: string, userRole: UserRoles): Promise<AnnouncementEntity> {
    const announcement = await visibleTo(
      this.repository
        .createQueryBuilder('announcement')
        .leftJoinAndSelect('announcement.publisher', 'publisher')
        .where('announcement.id = :id', { id }),
      userRole
    ).getOne()

    if (!announcement) {
      throw new NotFoundResponse(`Announcement ${id} not found`)
    }
    return announcement
  }

  /** Records that the person read the announcement, once, if it is meant for them. */
  async markAsRead(id: string, userId: string, userRole: UserRoles): Promise<void> {
    const visible = await visibleTo(
      this.repository.createQueryBuilder('announcement').where('announcement.id = :id', { id }),
      userRole
    ).getExists()
    if (!visible) {
      throw new NotFoundResponse(`Announcement ${id} not found`)
    }
    await this.reads.createQueryBuilder().insert().values({ userId, announcementId: id }).orIgnore().execute()
  }

  /** Gives each announcement the date the person read it, from their own reads. */
  private async withReads(announcements: AnnouncementEntity[], userId: string): Promise<AnnouncementEntity[]> {
    if (!announcements.length) return announcements
    const reads = await this.reads.find({
      select: { announcementId: true, createdAt: true },
      where: { userId, announcementId: In(announcements.map(({ id }) => id)) },
    })
    const readAt = new Map(reads.map((read) => [read.announcementId, read.createdAt]))
    return announcements.map((announcement) => Object.assign(announcement, { readAt: readAt.get(announcement.id) }))
  }
}
