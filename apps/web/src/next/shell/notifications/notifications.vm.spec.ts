import { Notification } from '@platon/feature/notification/common'
import { isSignal, notificationView, unreadLabel } from './notifications.vm'

const ME = 'user-me'
const createdAt = new Date(2026, 8, 28, 12, 30)

const notification = (data: object, readAt: Date | null = null): Notification => ({
  id: 'n1',
  userId: ME,
  createdAt,
  updatedAt: createdAt,
  readAt,
  data,
})

const course = { courseId: 'c1', courseName: 'Algorithmique', activityId: 'a1', activityName: 'TP 3' }

const resourceEvent = (type: string, data: object = {}, actorId = 'someone') =>
  notification({
    type: 'RESOURCE-EVENT',
    eventInfo: {
      type,
      actorId,
      resourceId: 'r1',
      data: { resourceId: 'r1', resourceName: 'Graphes', resourceType: 'EXERCISE', parentName: 'Cercle L1', ...data },
    },
  })

describe('notificationView', () => {
  it.each([
    [
      { type: 'COURSE-MEMBER-CREATION', ...course },
      'Inscription au cours Algorithmique',
      undefined,
      'person_add',
      '/courses/c1',
    ],
    [
      { type: 'ACTIVITY-MEMBER-CREATION', ...course },
      "Inscription à l'activité TP 3",
      'Algorithmique',
      'person_add',
      '/courses/c1',
    ],
    [
      { type: 'CORRECTOR-CREATED', ...course },
      'La correction de TP 3 vous a été confiée',
      'Algorithmique',
      'grading',
      '/courses/c1',
    ],
    [
      { type: 'CORRECTOR-REMOVED', ...course },
      'La correction de TP 3 vous a été retirée',
      'Algorithmique',
      'grading',
      '/courses/c1',
    ],
    [
      { type: 'CORRECTION-PENDING', ...course },
      'Nouvelles copies à corriger dans TP 3',
      'Algorithmique',
      'inbox',
      '/player/correction/c1',
    ],
    [
      { type: 'CORRECTION-AVAILABLE', ...course },
      'La correction de TP 3 est disponible',
      'Algorithmique',
      'rate_review',
      '/player/activity/a1',
    ],
    [{ type: 'ACTIVITY-CLOSED', ...course }, "L'activité TP 3 a fermé", 'Algorithmique', 'lock', '/courses/c1'],
  ])('says a %o in a short title, with its course and its target', (data, title, context, icon, path) => {
    const view = notificationView(notification(data), ME)

    expect(view).toEqual({
      id: 'n1',
      title,
      context,
      icon,
      hue: 'amber',
      date: createdAt,
      unread: true,
      link: path,
    })
  })

  it('says a resource moved by an administrator, in the colors of no course', () => {
    const view = notificationView(
      notification({
        type: 'RESOURCE-MOVED-BY-ADMIN',
        resourceId: 'r1',
        resourceName: 'Graphes',
        circleId: 'k1',
        circleName: 'Cercle L1',
      }),
      ME
    )

    expect(view).toMatchObject({
      title: 'Votre ressource Graphes a été déplacée dans votre cercle personnel',
      context: 'Cercle L1',
      icon: 'folder_open',
      link: '/resources/r1/overview',
    })
    expect(view?.hue).toBeUndefined()
  })

  it.each([
    ['MEMBER_CREATE', { userId: ME }, 'Vous avez rejoint Graphes', 'group_add'],
    ['MEMBER_REMOVE', {}, 'Votre accès à Graphes a été retiré', 'groups'],
    ['RESOURCE_CREATE', {}, 'Nouvelle ressource\u00a0: Graphes', 'add'],
    [
      'RESOURCE_STATUS_CHANGE',
      { newStatus: 'READY' },
      "Nouveau statut pour Graphes\u00a0: Prêt à l'utilisation",
      'flag',
    ],
  ])('says the resource event %s in words, without the code of a status', (type, data, title, icon) => {
    expect(notificationView(resourceEvent(type, data), ME)).toMatchObject({ title, icon, context: 'Cercle L1' })
  })

  it('tells a join request from a new member of a resource', () => {
    const request = resourceEvent('MEMBER_CREATE', { userId: 'u2' }, 'u2')
    const added = resourceEvent('MEMBER_CREATE', { userId: 'u2' }, 'u3')

    expect(notificationView(request, ME)?.title).toBe('Demande pour rejoindre Graphes')
    expect(notificationView(added, ME)?.title).toBe('Nouveau membre dans Graphes')
  })

  it('leads a new member to the members of the resource, another event to the resource, a removal nowhere', () => {
    expect(notificationView(resourceEvent('MEMBER_CREATE', { userId: ME }), ME)?.link).toBe(
      '/resources/r1/settings?tab=members'
    )
    expect(notificationView(resourceEvent('RESOURCE_CREATE'), ME)?.link).toBe('/resources/r1')
    expect(notificationView(resourceEvent('MEMBER_REMOVE'), ME)?.link).toBeUndefined()
  })

  it('keeps an invitation to collaborate answerable, until it expires', () => {
    const invitation = {
      type: 'RESOURCE-INVITATION',
      inviterId: 'u2',
      inviteeId: ME,
      inviterName: 'Camille Martin',
      inviteeName: 'Inès Benali',
      invitationId: 'i1',
      resourceId: 'r1',
      resourceName: 'Graphes',
      resourceType: 'CIRCLE',
    }

    const pending = notificationView(notification(invitation), ME)
    const expired = notificationView(notification({ ...invitation, expired: true }), ME)

    expect(pending).toMatchObject({
      title: 'Camille Martin vous invite à collaborer sur Graphes',
      icon: 'mail',
      invitation: { resourceId: 'r1', inviteeId: ME },
    })
    expect(pending?.link).toBeUndefined()
    expect(expired?.title).toBe("L'invitation à collaborer sur Graphes a expiré")
    expect(expired?.invitation).toBeUndefined()
  })

  it('tells a read notification from an unread one', () => {
    const data = { type: 'COURSE-MEMBER-CREATION', ...course }

    expect(notificationView(notification(data), ME)?.unread).toBe(true)
    expect(notificationView(notification(data, createdAt), ME)?.unread).toBe(false)
  })

  it('has no view for a signal or an unknown type', () => {
    expect(notificationView(notification({ type: 'EXERCISE-CHANGES', userId: 'u2', changes: {} }), ME)).toBeUndefined()
    expect(notificationView(notification({ type: 'SOMETHING-NEW' }), ME)).toBeUndefined()
  })
})

describe('isSignal', () => {
  it('knows the notifications that drive a screen and that a person never reads', () => {
    expect(isSignal(notification({ type: 'EXERCISE-CHANGES' }))).toBe(true)
    expect(isSignal(notification({ type: 'MODERATION-ACTIVITY-CHANGES' }))).toBe(true)
    expect(isSignal(notification({ type: 'CORRECTION-AVAILABLE', ...course }))).toBe(false)
  })
})

describe('unreadLabel', () => {
  it('agrees with the count it follows', () => {
    expect(`1 ${unreadLabel(1)}`).toBe('1 non lue')
    expect(`3 ${unreadLabel(3)}`).toBe('3 non lues')
  })
})
