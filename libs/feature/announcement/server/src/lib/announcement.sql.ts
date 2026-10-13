import { UserRoles } from '@platon/core/common'
import { SelectQueryBuilder } from 'typeorm'
import { AnnouncementEntity } from './announcement.entity'

/** What a person of `userRole` may see: an active announcement, meant for everyone or for their role. */
export const visibleTo = (query: SelectQueryBuilder<AnnouncementEntity>, userRole: UserRoles) =>
  query.andWhere('announcement.active = :active', { active: true }).andWhere(
    `(announcement."targetedRoles" IS NULL OR
        array_length(announcement."targetedRoles", 1) IS NULL OR
        :userRole = ANY(announcement."targetedRoles"))`,
    { userRole }
  )
