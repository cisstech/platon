import { Notification } from '@platon/feature/notification/common'
import { gql } from 'apollo-angular'
import { NotifFragment } from './notification.graphql.generated'

gql`
  fragment Notif on Notification {
    id
    user {
      id
      email
      username
      firstName
      lastName
    }
    readAt
    createdAt
    data
  }

  query ListNotifications($filters: NotificationFiltersInput, $first: Int, $after: String) {
    notifications(filters: $filters, first: $first, after: $after) {
      edges {
        cursor
        node {
          ...Notif
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }

  subscription OnChangeNotifications {
    onChangeNotifications {
      unreadCount
      newNotification {
        ...Notif
      }
    }
  }

  mutation MarkAsRead($id: UUID!) {
    markAsRead(id: $id)
  }

  mutation MarkAllAsRead {
    markAllAsRead
  }

  mutation DeleteNotification($id: UUID!) {
    deleteNotification(id: $id)
  }

  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`

export const decodeNotificationFragment = (fragment: NotifFragment): Notification => {
  return {
    id: fragment.id,
    createdAt: new Date(fragment.createdAt),
    data: fragment.data,
    userId: fragment.user.id,
    readAt: fragment.readAt ? new Date(fragment.readAt) : null,
  }
}
