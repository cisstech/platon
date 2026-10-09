import { CourseHue, IconName, courseHue } from '@platon/design-system'
import {
  ACTIVITY_CLOSED_NOTIFICATION,
  ACTIVITY_MEMBER_CREATION_NOTIFICATION,
  ActivityClosedNotification,
  ActivityMemberCreationNotification,
  CORRECTION_AVAILABLE_NOTIFICATION,
  CORRECTION_PENDING_NOTIFICATION,
  CORRECTOR_CREATED_NOTIFICATION,
  CORRECTOR_REMOVED_NOTIFICATION,
  COURSE_MEMBER_CREATION_NOTIFICATION,
  COURSE_SIGNAL_NOTIFICATIONS,
  CorrectionAvailableNotification,
  CorrectionPendingNotification,
  CorrectorCreatedNotification,
  CorrectorRemovedNotification,
  CourseMemberCreationNotification,
  RESOURCE_MOVED_BY_ADMIN_NOTIFICATION,
  ResourceMovedByAdminNotification,
} from '@platon/feature/course/common'
import { Notification } from '@platon/feature/notification/common'
import { RESOURCE_STATUS_NAMES } from '@platon/feature/resource/browser/shared'
import {
  RESOURCE_EVENT_NOTIFICATION,
  RESOURCE_INVITATION_NOTIFICATION,
  ResourceEventNotification,
  ResourceEventTypes,
  ResourceInvitationNotification,
  ResourceStatusChangeEventData,
} from '@platon/feature/resource/common'

/** What an invitation to collaborate needs to be accepted or declined. */
export interface InvitationAnswer {
  readonly resourceId: string
  readonly inviteeId: string
}

export interface NotificationView {
  readonly id: string
  /** A fact that stays true, in a few words. */
  readonly title: string
  /** What it is about, when the title does not name it: the course, or the circle of the resource. */
  readonly context?: string
  readonly icon: IconName
  /** The hue of the course concerned. */
  readonly hue?: CourseHue
  readonly date: Date
  readonly unread: boolean
  /** Where choosing it leads, as an address; none for a fact with nothing to open. */
  readonly link?: string
  readonly invitation?: InvitationAnswer
}

type CourseNotification =
  | CourseMemberCreationNotification
  | ActivityMemberCreationNotification
  | CorrectorCreatedNotification
  | CorrectorRemovedNotification
  | CorrectionPendingNotification
  | CorrectionAvailableNotification
  | ActivityClosedNotification

type KnownNotification =
  | CourseNotification
  | ResourceMovedByAdminNotification
  | ResourceEventNotification
  | ResourceInvitationNotification

type ViewContent = Omit<NotificationView, 'id' | 'date' | 'unread'>

const typeOf = (notification: Notification): unknown => (notification.data as { type?: unknown } | null)?.type

/** Notifications that drive a screen (activity monitor, player): a person never reads them. */
export const isSignal = (notification: Notification): boolean =>
  COURSE_SIGNAL_NOTIFICATIONS.includes(typeOf(notification) as string)

/** What a count of unread notifications counts, read after it: « 1 non lue », « 3 non lues ». */
export const unreadLabel = (count: number): string => (count > 1 ? 'non lues' : 'non lue')

/** About an activity: the course goes in the context line. About the course itself: the title names it. */
const ofCourse = (
  data: CourseNotification,
  title: string,
  icon: IconName,
  link = `/courses/${data.courseId}`
): ViewContent => ({
  title,
  context: data.type === COURSE_MEMBER_CREATION_NOTIFICATION ? undefined : data.courseName,
  icon,
  hue: courseHue(data.courseId),
  link,
})

const resourceEventContent = (data: ResourceEventNotification, me: string): ViewContent => {
  const event = data.eventInfo
  const resourceId = event.data.resourceId ?? event.resourceId
  const name = event.data.resourceName
  const resource = `/resources/${resourceId}`
  const content = (title: string, icon: IconName, link?: string): ViewContent => ({
    title,
    context: event.data.parentName || undefined,
    icon,
    link,
  })

  switch (event.type) {
    case ResourceEventTypes.MEMBER_CREATE: {
      const member = (event.data as unknown as { userId: string }).userId
      const title =
        member === me
          ? `Vous avez rejoint ${name}`
          : member === event.actorId
          ? `Demande pour rejoindre ${name}`
          : `Nouveau membre dans ${name}`
      return content(title, 'group_add', `/resources/${resourceId}/settings?tab=members`)
    }
    case ResourceEventTypes.MEMBER_REMOVE:
      return content(`Votre accès à ${name} a été retiré`, 'groups')
    case ResourceEventTypes.RESOURCE_CREATE:
      return content(`Nouvelle ressource\u00a0: ${name}`, 'add', resource)
    case ResourceEventTypes.RESOURCE_STATUS_CHANGE: {
      const status = (event.data as ResourceStatusChangeEventData).newStatus as keyof typeof RESOURCE_STATUS_NAMES
      return content(`Nouveau statut pour ${name}\u00a0: ${RESOURCE_STATUS_NAMES[status] ?? status}`, 'flag', resource)
    }
  }
}

const contentOf = (data: KnownNotification, me: string): ViewContent | undefined => {
  switch (data.type) {
    case COURSE_MEMBER_CREATION_NOTIFICATION:
      return ofCourse(data, `Inscription au cours ${data.courseName}`, 'person_add')
    case ACTIVITY_MEMBER_CREATION_NOTIFICATION:
      return ofCourse(data, `Inscription à l'activité ${data.activityName}`, 'person_add')
    case CORRECTOR_CREATED_NOTIFICATION:
      return ofCourse(data, `La correction de ${data.activityName} vous a été confiée`, 'grading')
    case CORRECTOR_REMOVED_NOTIFICATION:
      return ofCourse(data, `La correction de ${data.activityName} vous a été retirée`, 'grading')
    case CORRECTION_PENDING_NOTIFICATION:
      return ofCourse(
        data,
        `Nouvelles copies à corriger dans ${data.activityName}`,
        'inbox',
        `/player/correction/${data.courseId}`
      )
    case CORRECTION_AVAILABLE_NOTIFICATION:
      return ofCourse(
        data,
        `La correction de ${data.activityName} est disponible`,
        'rate_review',
        `/player/activity/${data.activityId}`
      )
    case ACTIVITY_CLOSED_NOTIFICATION:
      return ofCourse(data, `L'activité ${data.activityName} a fermé`, 'lock')
    case RESOURCE_MOVED_BY_ADMIN_NOTIFICATION:
      return {
        title: `Votre ressource ${data.resourceName} a été déplacée dans votre cercle personnel`,
        context: data.circleName,
        icon: 'folder_open',
        link: `/resources/${data.resourceId}/overview`,
      }
    case RESOURCE_EVENT_NOTIFICATION:
      return resourceEventContent(data, me)
    case RESOURCE_INVITATION_NOTIFICATION:
      return data.expired
        ? { title: `L'invitation à collaborer sur ${data.resourceName} a expiré`, icon: 'mail' }
        : {
            title: `${data.inviterName} vous invite à collaborer sur ${data.resourceName}`,
            icon: 'mail',
            invitation: { resourceId: data.resourceId, inviteeId: data.inviteeId },
          }
    default:
      return undefined
  }
}

/**
 * A notification as the panel shows it, for the person `me`. A signal, or a type this interface does
 * not know, has no view.
 */
export const notificationView = (notification: Notification, me: string): NotificationView | undefined => {
  if (isSignal(notification)) return undefined
  const content = contentOf(notification.data as KnownNotification, me)
  if (!content) return undefined
  return {
    id: notification.id,
    ...content,
    date: notification.createdAt,
    unread: !notification.readAt,
  }
}
