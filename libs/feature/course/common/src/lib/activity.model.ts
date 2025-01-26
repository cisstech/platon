import { ActivityPermissions } from './permissions.model'

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
