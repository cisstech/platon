import { RestrictionList } from './activity-restriction.model'
import { ActivityPermissions } from './permissions.model'
import { ActivitySettings } from '@platon/feature/compiler'

export interface Activity {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date

  readonly courseId: string
  readonly sectionId: string

  readonly openAt?: Date | null
  readonly closeAt?: Date | null
  readonly isChallenge: boolean
  readonly isPeerComparison: boolean
  readonly order?: number

  readonly title: string
  readonly resourceId: string
  readonly exerciseCount: number
  readonly state: ActivityOpenStates
  readonly timeSpent: number
  readonly progression: number
  readonly permissions: ActivityPermissions

  readonly ignoreRestrictions?: boolean // checkActivityDateRestrictions
  readonly restrictions?: RestrictionList[] | null

  readonly colorHue?: number

  readonly activitySettings?: ActivitySettings
  readonly code: string

  /** Whether the activity counts in the grades. False until a teacher says otherwise. */
  readonly graded?: boolean
}

/** An activity a person can play, as their home lists it (`GET /activities/mine`). */
export interface PlayableActivity {
  readonly id: string
  readonly courseId: string
  readonly courseName: string
  readonly title: string

  /**
   * Their dates: those of the restriction period that concerns them (none when it has no date
   * range), or the activity's own when it has no restriction.
   */
  readonly openAt?: Date | null
  readonly closeAt?: Date | null
  readonly state: ActivityOpenStates

  readonly isChallenge: boolean
  readonly graded: boolean
  /** In seconds, absent when unlimited. */
  readonly duration?: number
  /** Absent when unlimited. */
  readonly attempts?: number

  readonly exerciseCount: number
  /** Exercises of their copy that they answered. */
  readonly exercisesDone: number
  readonly started: boolean
  readonly terminated: boolean
}

/** An activity of a course a person teaches, as their home lists it (`GET /activities/taught`). */
export interface TaughtActivity {
  readonly id: string
  readonly courseId: string
  readonly courseName: string
  readonly title: string

  /** The activity's own dates, whatever its restrictions. */
  readonly openAt?: Date | null
  readonly closeAt?: Date | null
  readonly state: ActivityOpenStates
  /** Whether restriction periods give its students their own dates, in place of the dates above. */
  readonly restricted: boolean

  readonly isChallenge: boolean
  readonly graded: boolean

  /**
   * Students of the course who can play it, by its members, its groups and its restriction periods;
   * a person who also teaches the course is not one of them.
   */
  readonly studentCount: number
  /** Those of them who started it. */
  readonly startedCount: number
  /** Average on 100 of their started copies, absent when none started. */
  readonly averageGrade?: number
}

export interface ActivityFilters {
  readonly sectionId?: string | null
  readonly challenge?: boolean | null
}

export interface CreateActivity {
  readonly sectionId: string

  readonly resourceId: string
  readonly resourceVersion: string

  readonly openAt?: Date
  readonly closeAt?: Date
  readonly isChallenge?: boolean
}

export interface UpdateActivity {
  readonly openAt?: Date | null
  readonly closeAt?: Date | null
  readonly colorHue?: number | null
  readonly ignoreRestrictions?: boolean
  readonly activitySettings?: ActivitySettings
  readonly code?: string
  readonly graded?: boolean
}

export interface ReloadActivity {
  readonly version?: string
}

export type ActivityOpenStates = 'opened' | 'closed' | 'planned'

export const calculateActivityOpenState = (value: {
  openAt?: Date | string | null
  closeAt?: Date | string | null
}): ActivityOpenStates => {
  const now = new Date()
  const openAt = value.openAt ? new Date(value.openAt) : undefined
  const closeAt = value.closeAt ? new Date(value.closeAt) : undefined

  if (openAt && closeAt) {
    if (now < openAt) {
      return 'planned'
    } else if (now >= openAt && now <= closeAt) {
      return 'opened'
    } else {
      return 'closed'
    }
  } else if (openAt) {
    if (now < openAt) {
      return 'planned'
    } else {
      return 'opened'
    }
  } else if (closeAt) {
    if (now <= closeAt) {
      return 'opened'
    } else {
      return 'closed'
    }
  } else {
    return 'opened'
  }
}
