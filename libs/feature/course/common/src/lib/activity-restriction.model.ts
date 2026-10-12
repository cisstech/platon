export const RestrictionType = {
  DateRange: 'DateRange',
  Correctors: 'Correctors',
  Groups: 'Groups',
  Members: 'Members',
  Others: 'Others',
} as const

export type RestrictionType = (typeof RestrictionType)[keyof typeof RestrictionType]

export interface RestrictionConfig {
  DateRange: {
    start: Date | undefined
    end: Date | undefined
  }
  Members: {
    members?: string[]
  }
  Correctors: {
    correctors?: string[]
  }
  Groups: {
    groups?: string[]
  }
  Others: {
    enabled?: boolean
  }
}

export interface Restriction {
  type: RestrictionType
  config: RestrictionConfig[keyof RestrictionConfig]
}
// ActivityRestrictions
export interface RestrictionList {
  restriction: Restriction[]
}

/** What the restrictions of an activity need to know of a person in its course. */
export interface RestrictionSubject {
  readonly userId: string
  /** The `CourseMembers` rows that hold them: their own, and those of the user groups they belong to. */
  readonly memberIds: ReadonlySet<string>
  /** The course groups (`CourseGroups.id`) they belong to. */
  readonly groupIds: ReadonlySet<string>
}

export interface ActivityDates {
  readonly openAt?: Date
  readonly closeAt?: Date
}

const toDate = (value?: Date | string | null): Date | undefined => (value ? new Date(value) : undefined)

const isOthers = (period: RestrictionList) => period.restriction.some((r) => r.type === RestrictionType.Others)

/**
 * Whether a member list names the person: one of their member rows, or one person of a user group,
 * written `<member row>:<user id>` by the member picker.
 */
const listNames = (ids: string[] | undefined, subject: RestrictionSubject): boolean =>
  !!ids?.some((id) => subject.memberIds.has(id) || (!!subject.userId && id.endsWith(`:${subject.userId}`)))

const names = (restriction: Restriction, subject: RestrictionSubject): boolean => {
  switch (restriction.type) {
    case RestrictionType.Members:
      return listNames((restriction.config as RestrictionConfig['Members']).members, subject)
    case RestrictionType.Correctors:
      return listNames((restriction.config as RestrictionConfig['Correctors']).correctors, subject)
    case RestrictionType.Groups:
      return !!(restriction.config as RestrictionConfig['Groups']).groups?.some((id) => subject.groupIds.has(id))
    default:
      return false
  }
}

const periodDates = (period: RestrictionList): ActivityDates => {
  const range = period.restriction.find((r) => r.type === RestrictionType.DateRange)?.config as
    | RestrictionConfig['DateRange']
    | undefined
  return { openAt: toDate(range?.start), closeAt: toDate(range?.end) }
}

/**
 * The dates of an activity for a person: those of the first period that names them, else those of
 * the "Others" period, else `null` when no period concerns them. A period without a date range gives
 * no dates. Without restrictions, or when they are ignored, the activity's own dates.
 */
export const activityDatesFor = (
  activity: {
    openAt?: Date | string | null
    closeAt?: Date | string | null
    ignoreRestrictions?: boolean | null
    restrictions?: RestrictionList[] | null
  },
  subject: RestrictionSubject
): ActivityDates | null => {
  const periods = Array.isArray(activity.restrictions) ? activity.restrictions : []
  if (activity.ignoreRestrictions || !periods.length) {
    return { openAt: toDate(activity.openAt), closeAt: toDate(activity.closeAt) }
  }

  const named = periods.find((period) => !isOthers(period) && period.restriction.some((r) => names(r, subject)))
  const period = named ?? periods.find(isOthers)
  return period ? periodDates(period) : null
}
