import { Injectable, Inject } from '@nestjs/common'
import { Activity, activityDatesFor, RestrictionConfig, RestrictionSubject } from '@platon/feature/course/common'
import { ActivityEntity } from './activity.entity'
import { CourseMemberService } from '../course-member/course-member.service'
import { IRequest } from '@platon/core/server'
import { CLS_REQ } from 'nestjs-cls'

/** The dates an activity takes for a person no period concerns: invalid, so that it reads closed. */
const noAccess = () => ({ start: new Date('Invalid Date'), end: new Date('Invalid Date') })

/** Nobody: the subject of a request without a user, or of an activity without periods. */
const NO_SUBJECT: RestrictionSubject = { userId: '', memberIds: new Set(), groupIds: new Set() }

@Injectable()
export class ActivityDatesService {
  constructor(
    @Inject(CLS_REQ)
    private readonly request: IRequest,
    private readonly courseMemberService: CourseMemberService
  ) {}

  /**
   * Met à jour les dates d'ouverture et de fermeture des activités en fonction des restrictions
   */
  async updateActivitiesDates(
    activities: ActivityEntity[]
  ): Promise<{ start: Date | undefined; end: Date | undefined }> {
    const globalDateRange: { start: Date | undefined; end: Date | undefined } = {
      start: undefined,
      end: undefined,
    }

    const subjects = new Map<string, Promise<RestrictionSubject>>()
    const subjectOf = (activity: ActivityEntity) => {
      const userId = this.request?.user?.id
      if (!userId || !Array.isArray(activity.restrictions) || !activity.restrictions.length) {
        return Promise.resolve(NO_SUBJECT)
      }
      if (!subjects.has(activity.courseId)) {
        subjects.set(activity.courseId, this.courseMemberService.restrictionSubject(activity.courseId, userId))
      }
      return subjects.get(activity.courseId) as Promise<RestrictionSubject>
    }

    for (const activity of activities) {
      if (!activity.ignoreRestrictions) {
        const dates = activityDatesFor(activity, await subjectOf(activity))
        const dateRange = dates ? { start: dates.openAt, end: dates.closeAt } : noAccess()
        activity.openAt = dateRange.start
        activity.closeAt = dateRange.end
        globalDateRange.start = dateRange.start
        globalDateRange.end = dateRange.end
      }
    }

    return globalDateRange
  }

  /**
   * Rouvre ou ferme toutes les restrictions d'une activité
   */
  async reopenOrCloseAllRestrictions(activity: Activity, isOpen: boolean): Promise<void> {
    if (!activity.restrictions?.length) {
      return
    }

    activity.restrictions.forEach((restrictionList) => {
      restrictionList.restriction.forEach((restriction) => {
        if (restriction.type === 'DateRange') {
          const config = restriction.config as RestrictionConfig['DateRange']

          if (isOpen) {
            config.end = undefined
          } else {
            config.end = new Date()
            if (config.start && new Date(config.start).getTime() > new Date(config.end).getTime()) {
              config.start = undefined
            }
          }
        }
      })
    })

    // Si on rouvre et qu'il n'y a aucune période accessible, ajouter une période "Others"
    if (isOpen) {
      const hasAccessiblePeriod = activity.restrictions.some((restrictionList) =>
        restrictionList.restriction.some((r) => r.type === 'Others')
      )

      if (!hasAccessiblePeriod) {
        this.addDefaultOthersPeriod(activity)
      }
    }
  }

  /**
   * Ajoute une période "Others" par défaut pour donner accès à tous
   */
  private addDefaultOthersPeriod(activity: Activity): void {
    if (activity?.restrictions) {
      activity.restrictions.push({
        restriction: [
          {
            type: 'DateRange',
            config: {
              start: undefined,
              end: undefined,
            },
          },
          {
            type: 'Others',
            config: {
              enabled: true,
            },
          },
        ],
      })
    }
  }
}
