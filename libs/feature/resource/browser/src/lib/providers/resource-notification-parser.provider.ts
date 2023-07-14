import { Injector } from '@angular/core'
import { Router } from '@angular/router'
import { ImgIcon } from '@cisstech/nge/ui/icon'
import { DialogService } from '@platon/core/browser'
import { NotificationParser, NotificationRenderer } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import {
  RESOURCE_EVENT_NOTIFICATION,
  RESOURCE_INVITATION_NOTIFICATION,
  ResourceEventNotification,
  ResourceInvitationNotification,
} from '@platon/feature/resource/common'
import { firstValueFrom } from 'rxjs'
import { ResourceService } from '../api/resource.service'
import { ResourceEventItemComponent } from '../components/event-item/event-item.component'

export const ResourceEventNotificationParser: NotificationParser = {
  support(notification: Notification<ResourceEventNotification>): boolean {
    return notification.data.type === RESOURCE_EVENT_NOTIFICATION
  },
  renderer(notification: Notification<ResourceEventNotification>, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    const event = notification.data.eventInfo
    const resourceId = 'resourceId' in event.data ? event.data.resourceId : event.resourceId
    const resourceType = event.data.resourceType?.toLowerCase()
    return {
      icon: new ImgIcon(`/assets/images/resources/${resourceType}.svg`),
      content: ResourceEventItemComponent,
      onClick: ({ onClose }) => {
        if (event.type === 'MEMBER_REMOVE') return
        router.navigate([`/resources/${resourceId}`])
        onClose()
      },
    }
  },
}

export const ResourceInvitationNotificationParser: NotificationParser = {
  support(notification: Notification<ResourceInvitationNotification>): boolean {
    return notification.data.type === RESOURCE_INVITATION_NOTIFICATION
  },
  renderer(notification: Notification<ResourceInvitationNotification>, injector: Injector): NotificationRenderer {
    const router = injector.get(Router)
    const dialogService = injector.get(DialogService)
    const resourceService = injector.get(ResourceService)
    const { data } = notification

    return {
      icon: new ImgIcon(`/assets/images/resources/${data.resourceType.toLowerCase()}.svg`),
      content: data.expired
        ? `Vous aviez été invité à collaborer sur "${data.resourceName}" par "${data.inviterName}"`
        : `Vous avez été invité à collaborer sur "${data.resourceName}" par "${data.inviterName}"`,
      actions: !data.expired
        ? [
            {
              label: 'Accepter',
              type: 'primary',
              icon: 'check-circle',
              onClick: async ({ onClose, onDelete }) => {
                try {
                  const invitation = await firstValueFrom(
                    resourceService.findInvitation(data.resourceId, data.inviteeId)
                  )
                  await firstValueFrom(resourceService.acceptInvitation(invitation))

                  router.navigate([`/resources/${data.resourceId}`])

                  onDelete(notification)
                  onClose()
                } catch {
                  dialogService.error("Une erreur est survenue lors de l'acceptation de l'invitation.")
                }
              },
            },
            {
              label: 'Décliner',
              type: 'danger',
              icon: 'close-circle',
              onClick: async ({ onClose, onDelete }) => {
                try {
                  const invitation = await firstValueFrom(
                    resourceService.findInvitation(data.resourceId, data.inviteeId)
                  )
                  await firstValueFrom(resourceService.deleteInvitation(invitation))

                  onDelete(notification)
                  onClose()
                } catch {
                  dialogService.error("Une erreur est survenue lors de suppression de l'invitation.")
                }
              },
            },
          ]
        : [],
    }
  },
}

export const ResourceNotificationParsers: NotificationParser[] = [
  ResourceEventNotificationParser,
  ResourceInvitationNotificationParser,
]
